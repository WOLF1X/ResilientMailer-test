import { Email, EmailLog, ProviderStat, SystemStat, User, InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email methods
  createEmail(email: Email): Promise<Email>;
  updateEmail(id: string, updates: Partial<Email>): Promise<Email | undefined>;
  getEmail(id: string): Promise<Email | undefined>;
  getRecentEmails(limit: number): Promise<Email[]>;
  
  // Email log methods
  createEmailLog(log: Omit<EmailLog, 'id'>): Promise<EmailLog>;
  getRecentLogs(limit: number): Promise<EmailLog[]>;
  
  // Provider stats methods
  getProviderStats(provider: string): Promise<ProviderStat | undefined>;
  updateProviderStats(provider: string, stats: Partial<ProviderStat>): Promise<ProviderStat>;
  
  // System stats methods
  getSystemStats(): Promise<SystemStat | undefined>;
  updateSystemStats(stats: Partial<SystemStat>): Promise<SystemStat>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private emails: Map<string, Email> = new Map();
  private emailLogs: EmailLog[] = [];
  private providerStats: Map<string, ProviderStat> = new Map();
  private systemStats: SystemStat | undefined;
  private currentUserId = 1;
  private currentLogId = 1;
  private currentProviderStatsId = 1;
  private currentSystemStatsId = 1;

  constructor() {
    // Initialize default system stats
    this.systemStats = {
      id: this.currentSystemStatsId++,
      emailsSentToday: 1247,
      successRate: 98,
      queueSize: 0,
      rateLimitUsage: 0,
      lastUpdated: new Date(),
    };

    // Initialize default provider stats
    this.providerStats.set('MockProvider A', {
      id: this.currentProviderStatsId++,
      provider: 'MockProvider A',
      status: 'healthy',
      successRate: 99,
      avgLatency: 125,
      lastChecked: new Date(),
      circuitBreakerState: 'closed',
    });

    this.providerStats.set('MockProvider B', {
      id: this.currentProviderStatsId++,
      provider: 'MockProvider B',
      status: 'healthy',
      successRate: 97,
      avgLatency: 89,
      lastChecked: new Date(),
      circuitBreakerState: 'closed',
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Email methods
  async createEmail(email: Email): Promise<Email> {
    this.emails.set(email.id, email);
    return email;
  }

  async updateEmail(id: string, updates: Partial<Email>): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updatedEmail = { ...email, ...updates };
    this.emails.set(id, updatedEmail);
    
    // Update system stats if email was sent
    if (updates.status === 'sent' && this.systemStats) {
      this.systemStats.emailsSentToday++;
      this.updateSuccessRate();
    }
    
    return updatedEmail;
  }

  async getEmail(id: string): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async getRecentEmails(limit: number): Promise<Email[]> {
    return Array.from(this.emails.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Email log methods
  async createEmailLog(log: Omit<EmailLog, 'id'>): Promise<EmailLog> {
    const emailLog: EmailLog = {
      id: this.currentLogId++,
      ...log,
    };
    this.emailLogs.push(emailLog);
    
    // Keep only last 1000 logs
    if (this.emailLogs.length > 1000) {
      this.emailLogs = this.emailLogs.slice(-1000);
    }
    
    return emailLog;
  }

  async getRecentLogs(limit: number): Promise<EmailLog[]> {
    return this.emailLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Provider stats methods
  async getProviderStats(provider: string): Promise<ProviderStat | undefined> {
    return this.providerStats.get(provider);
  }

  async updateProviderStats(provider: string, stats: Partial<ProviderStat>): Promise<ProviderStat> {
    const existing = this.providerStats.get(provider);
    const updated: ProviderStat = {
      id: existing?.id || this.currentProviderStatsId++,
      provider,
      status: 'healthy',
      successRate: 95,
      avgLatency: 100,
      lastChecked: new Date(),
      circuitBreakerState: 'closed',
      ...existing,
      ...stats,
    };
    
    this.providerStats.set(provider, updated);
    return updated;
  }

  // System stats methods
  async getSystemStats(): Promise<SystemStat | undefined> {
    return this.systemStats;
  }

  async updateSystemStats(stats: Partial<SystemStat>): Promise<SystemStat> {
    this.systemStats = {
      id: this.systemStats?.id || this.currentSystemStatsId++,
      emailsSentToday: 0,
      successRate: 0,
      queueSize: 0,
      rateLimitUsage: 0,
      lastUpdated: new Date(),
      ...this.systemStats,
      ...stats,
    };
    return this.systemStats;
  }

  private updateSuccessRate(): void {
    if (!this.systemStats) return;
    
    const emails = Array.from(this.emails.values());
    const total = emails.length;
    const successful = emails.filter(e => e.status === 'sent').length;
    
    if (total > 0) {
      this.systemStats.successRate = Math.round((successful / total) * 100);
    }
  }
}

export const storage = new MemStorage();
