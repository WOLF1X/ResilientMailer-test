import { Email } from "@shared/schema";

export interface QueuedEmail extends Email {
  scheduledAt?: Date;
  processingStartedAt?: Date;
}

export class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;

  add(email: QueuedEmail): void {
    this.queue.push({
      ...email,
      scheduledAt: new Date()
    });
  }

  remove(emailId: string): boolean {
    const index = this.queue.findIndex(email => email.id === emailId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  getNext(): QueuedEmail | null {
    const now = new Date();
    
    // Find the next email that should be processed
    const nextEmail = this.queue
      .filter(email => !email.processingStartedAt && (!email.scheduledAt || email.scheduledAt <= now))
      .sort((a, b) => {
        // Priority order: high -> normal -> low
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Then by creation time
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })[0];

    if (nextEmail) {
      nextEmail.processingStartedAt = now;
      return nextEmail;
    }

    return null;
  }

  markCompleted(emailId: string): void {
    this.remove(emailId);
  }

  markFailed(emailId: string, retryDelay?: number): void {
    const email = this.queue.find(e => e.id === emailId);
    if (email) {
      email.processingStartedAt = undefined;
      if (retryDelay) {
        email.scheduledAt = new Date(Date.now() + retryDelay);
      }
    }
  }

  size(): number {
    return this.queue.length;
  }

  getAll(): QueuedEmail[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }

  getPendingCount(): number {
    return this.queue.filter(email => !email.processingStartedAt).length;
  }

  getProcessingCount(): number {
    return this.queue.filter(email => email.processingStartedAt).length;
  }
}
