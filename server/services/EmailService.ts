import { v4 as uuidv4 } from 'uuid';
import { EmailProvider, MockProviderA, MockProviderB } from './MockEmailProviders';
import { CircuitBreaker, CircuitState } from './CircuitBreaker';
import { RateLimiter } from './RateLimiter';
import { EmailQueue, QueuedEmail } from './EmailQueue';
import { IStorage } from '../storage';
import { Email, InsertEmail, EmailLog } from '@shared/schema';

export class EmailService {
  private providers: EmailProvider[] = [];
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private rateLimiter: RateLimiter;
  private queue: EmailQueue;
  private sentEmails: Set<string> = new Set(); // For idempotency
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(private storage: IStorage) {
    // Initialize providers
    this.providers = [new MockProviderA(), new MockProviderB()];
    
    // Initialize circuit breakers for each provider
    this.providers.forEach(provider => {
      this.circuitBreakers.set(provider.name, new CircuitBreaker(5, 60000, 120000));
    });

    // Initialize rate limiter (100 emails per minute)
    this.rateLimiter = new RateLimiter(100, 60000);
    
    // Initialize queue
    this.queue = new EmailQueue();

    // Start queue processing
    this.startQueueProcessor();

    this.log('info', 'EmailService initialized with providers: ' + this.providers.map(p => p.name).join(', '));
  }

  async sendEmail(emailData: InsertEmail, idempotencyKey?: string): Promise<{ id: string; status: string; message: string }> {
    // Check idempotency
    if (idempotencyKey && this.sentEmails.has(idempotencyKey)) {
      return {
        id: idempotencyKey,
        status: 'duplicate',
        message: 'Email already sent (idempotency check)'
      };
    }

    // Check rate limit
    if (!this.rateLimiter.isAllowed()) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((this.rateLimiter.getResetTime() - Date.now()) / 1000)} seconds`);
    }

    // Create email record
    const emailId = idempotencyKey || uuidv4();
    const email: Email = {
      id: emailId,
      recipient: emailData.recipient,
      subject: emailData.subject,
      message: emailData.message,
      priority: emailData.priority || 'normal',
      status: 'pending',
      provider: null,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      sentAt: null,
      failedAt: null,
      lastError: null,
      metadata: null,
    };

    // Store email
    await this.storage.createEmail(email);
    
    // Add to queue
    this.queue.add(email as QueuedEmail);

    // Mark as sent for idempotency
    if (idempotencyKey) {
      this.sentEmails.add(idempotencyKey);
    }

    this.log('info', `Email ${emailId} queued for delivery to ${emailData.recipient}`);

    return {
      id: emailId,
      status: 'queued',
      message: 'Email queued for delivery'
    };
  }

  private async processEmailFromQueue(): Promise<void> {
    const email = this.queue.getNext();
    if (!email) return;

    try {
      const result = await this.attemptSendEmail(email);
      
      if (result.success) {
        // Mark as sent
        email.status = 'sent';
        email.sentAt = new Date();
        email.provider = result.provider;
        
        await this.storage.updateEmail(email.id, email);
        this.queue.markCompleted(email.id);
        
        this.log('success', `Email ${email.id} delivered via ${result.provider}`, result.provider);
      } else {
        // Handle failure
        await this.handleEmailFailure(email, result.error);
      }
    } catch (error) {
      await this.handleEmailFailure(email, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async attemptSendEmail(email: Email): Promise<{ success: boolean; provider?: string; messageId?: string; error?: string }> {
    for (const provider of this.providers) {
      const circuitBreaker = this.circuitBreakers.get(provider.name);
      if (!circuitBreaker) continue;

      try {
        // Check if provider is healthy and circuit breaker allows requests
        if (circuitBreaker.getState() === CircuitState.OPEN) {
          this.log('warn', `Circuit breaker OPEN for ${provider.name}, skipping`);
          continue;
        }

        const result = await circuitBreaker.execute(async () => {
          return await this.sendWithRetry(provider, email);
        });

        if (result.success) {
          return {
            success: true,
            provider: provider.name,
            messageId: result.messageId
          };
        }
      } catch (error) {
        this.log('error', `Provider ${provider.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`, provider.name);
        continue;
      }
    }

    return {
      success: false,
      error: 'All providers failed'
    };
  }

  private async sendWithRetry(provider: EmailProvider, email: Email, maxRetries: number = 3): Promise<{ success: boolean; messageId?: string }> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await provider.send({
          recipient: email.recipient,
          subject: email.subject,
          message: email.message
        });

        if (result.success) {
          return { success: true, messageId: result.messageId };
        } else {
          lastError = result.error || 'Unknown error';
          if (attempt < maxRetries) {
            const delay = this.calculateBackoffDelay(attempt);
            this.log('warn', `Attempt ${attempt}/${maxRetries} failed for email ${email.id}, retrying in ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        if (attempt < maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(lastError);
  }

  private calculateBackoffDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
  }

  private async handleEmailFailure(email: Email, error: string): Promise<void> {
    email.retryCount = (email.retryCount || 0) + 1;
    email.lastError = error;

    if (email.retryCount >= (email.maxRetries || 3)) {
      // Max retries reached, mark as failed
      email.status = 'failed';
      email.failedAt = new Date();
      await this.storage.updateEmail(email.id, email);
      this.queue.markCompleted(email.id);
      
      this.log('error', `Email ${email.id} failed permanently after ${email.retryCount} attempts: ${error}`);
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = this.calculateBackoffDelay(email.retryCount);
      email.status = `retry ${email.retryCount}/${email.maxRetries}`;
      await this.storage.updateEmail(email.id, email);
      this.queue.markFailed(email.id, retryDelay);
      
      this.log('warn', `Email ${email.id} scheduled for retry ${email.retryCount}/${email.maxRetries} in ${retryDelay}ms`);
    }
  }

  private startQueueProcessor(): void {
    this.processingInterval = setInterval(async () => {
      try {
        await this.processEmailFromQueue();
      } catch (error) {
        this.log('error', `Queue processor error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 1000); // Process every second
  }

  private async log(level: string, message: string, provider?: string): Promise<void> {
    const logEntry: Omit<EmailLog, 'id'> = {
      emailId: null,
      level,
      message,
      provider: provider || null,
      timestamp: new Date(),
      metadata: null,
    };

    try {
      await this.storage.createEmailLog(logEntry);
    } catch (error) {
      console.error('Failed to save log:', error);
    }

    // Also log to console
    console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`);
  }

  // Public methods for dashboard
  async getStats(): Promise<{
    emailsSentToday: number;
    successRate: number;
    queueSize: number;
    rateLimitUsage: number;
  }> {
    const stats = await this.storage.getSystemStats();
    
    return {
      emailsSentToday: stats?.emailsSentToday || 0,
      successRate: stats?.successRate || 0,
      queueSize: this.queue.size(),
      rateLimitUsage: this.rateLimiter.getUsagePercentage(),
    };
  }

  async getProviderStatuses(): Promise<Array<{
    name: string;
    status: string;
    latency: string;
    successRate: string;
    description: string;
  }>> {
    const providers = [];
    
    for (const provider of this.providers) {
      const circuitBreaker = this.circuitBreakers.get(provider.name);
      const isHealthy = await provider.isHealthy();
      const circuitState = circuitBreaker?.getState() || 'closed';
      
      let status = 'Healthy';
      if (circuitState === 'open') {
        status = 'Circuit Open';
      } else if (!isHealthy) {
        status = 'Degraded';
      }

      const providerStats = await this.storage.getProviderStats(provider.name);
      
      providers.push({
        name: provider.name,
        status,
        latency: `Avg: ${provider.getLatency()}ms`,
        successRate: `${providerStats?.successRate || 95}%`,
        description: provider.name === 'MockProvider A' ? 'Primary email provider' : 'Fallback email provider'
      });
    }
    
    return providers;
  }

  getCircuitBreakerStatus(): string {
    const states = Array.from(this.circuitBreakers.values()).map(cb => cb.getState());
    if (states.includes(CircuitState.OPEN)) {
      return 'OPEN';
    } else if (states.includes(CircuitState.HALF_OPEN)) {
      return 'HALF-OPEN';
    } else {
      return 'CLOSED';
    }
  }

  async getRecentEmails(limit: number = 10): Promise<Email[]> {
    return await this.storage.getRecentEmails(limit);
  }

  async getRecentLogs(limit: number = 50): Promise<EmailLog[]> {
    return await this.storage.getRecentLogs(limit);
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}
