export interface EmailProvider {
  name: string;
  send(email: { recipient: string; subject: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }>;
  isHealthy(): Promise<boolean>;
  getLatency(): number;
}

export class MockProviderA implements EmailProvider {
  name = "MockProvider A";
  private latency = 125;
  private failureRate = 0.008; // 0.8% failure rate

  async send(email: { recipient: string; subject: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, this.latency + Math.random() * 50));
    
    // Simulate occasional failures
    if (Math.random() < this.failureRate) {
      return {
        success: false,
        error: "Connection timeout - MockProvider A"
      };
    }

    return {
      success: true,
      messageId: `mp_a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async isHealthy(): Promise<boolean> {
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 50));
    return Math.random() > 0.05; // 95% uptime
  }

  getLatency(): number {
    return this.latency;
  }
}

export class MockProviderB implements EmailProvider {
  name = "MockProvider B";
  private latency = 89;
  private failureRate = 0.022; // 2.2% failure rate

  async send(email: { recipient: string; subject: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, this.latency + Math.random() * 30));
    
    // Simulate occasional failures
    if (Math.random() < this.failureRate) {
      return {
        success: false,
        error: "Rate limit exceeded - MockProvider B"
      };
    }

    return {
      success: true,
      messageId: `mp_b_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async isHealthy(): Promise<boolean> {
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 30));
    return Math.random() > 0.03; // 97% uptime
  }

  getLatency(): number {
    return this.latency;
  }
}
