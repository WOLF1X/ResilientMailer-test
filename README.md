# Resilient Email Service

A robust TypeScript email sending service with retry logic, circuit breakers, fallback mechanisms, and comprehensive monitoring dashboard.

## 🚀 Features

### Core Email Service
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Fallback Mechanism**: Automatic provider switching on failure
- **Idempotency**: Prevents duplicate email sends using idempotency keys
- **Rate Limiting**: Token bucket implementation (100 emails/minute)
- **Circuit Breaker**: Prevents cascading failures with CLOSED/OPEN/HALF-OPEN states
- **Queue System**: Priority-based email processing with scheduling

### Mock Email Providers
- **MockProvider A**: Primary provider (125ms latency, 0.8% failure rate)
- **MockProvider B**: Fallback provider (89ms latency, 2.2% failure rate)
- **Health Monitoring**: Continuous provider health checks

### Dashboard Features
- **Real-time Stats**: Emails sent, success rate, queue size, rate limit usage
- **Provider Monitoring**: Live status, latency, and success rates
- **Email History**: Recent email delivery tracking with status
- **System Logs**: Real-time log streaming with filtering
- **Send Email Form**: Interactive form with validation

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
```
server/
├── services/
│   ├── EmailService.ts      # Main email orchestrator
│   ├── CircuitBreaker.ts    # Circuit breaker implementation
│   ├── RateLimiter.ts       # Rate limiting with sliding window
│   ├── EmailQueue.ts        # Priority queue management
│   └── MockEmailProviders.ts # Simulated email providers
├── routes.ts                # REST API endpoints
├── storage.ts               # In-memory data storage
└── index.ts                 # Express server setup
```

### Frontend (React + TypeScript)
```
client/src/
├── components/
│   ├── StatsGrid.tsx        # Dashboard metrics display
│   ├── SendEmailForm.tsx    # Email sending form
│   ├── ProviderStatus.tsx   # Provider health monitoring
│   ├── EmailHistory.tsx     # Email delivery history
│   ├── SystemLogs.tsx       # Real-time system logs
│   └── Sidebar.tsx          # Navigation sidebar
├── pages/
│   └── Dashboard.tsx        # Main dashboard page
└── lib/
    └── queryClient.ts       # React Query configuration
```

### Shared Schema
```
shared/
└── schema.ts                # Drizzle ORM schemas and types
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Dashboard: http://localhost:5000
   - API: http://localhost:5000/api

## 📡 API Endpoints

### Email Operations
- `POST /api/emails/send` - Send email with retry logic
- `GET /api/emails/recent` - Get recent email history
- `GET /api/emails/:id` - Get specific email details

### Monitoring & Stats
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/providers/status` - Provider health status
- `GET /api/circuit-breaker/status` - Circuit breaker state
- `GET /api/logs/recent` - Recent system logs

### Request Examples

**Send Email:**
```bash
curl -X POST http://localhost:5000/api/emails/send \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "recipient": "user@example.com",
    "subject": "Test Email",
    "message": "Hello from the email service!",
    "priority": "normal"
  }'
```

**Get Dashboard Stats:**
```bash
curl http://localhost:5000/api/dashboard/stats
```

## 🏛️ Design Patterns

### Circuit Breaker Pattern
- **CLOSED**: Normal operation, all requests pass through
- **OPEN**: Failure threshold exceeded, requests fail fast
- **HALF-OPEN**: Testing recovery, limited requests allowed

### Retry Strategy
- Exponential backoff: 1s, 2s, 4s, 8s (max 30s)
- Maximum 3 retry attempts per email
- Provider failover on consecutive failures

### Queue Management
- Priority-based processing (high > normal > low)
- Scheduled retry with exponential delay
- Real-time processing every 1 second

## 📊 Monitoring

### Key Metrics
- **Emails Sent Today**: Total daily email count
- **Success Rate**: Percentage of successful deliveries
- **Queue Size**: Pending emails in queue
- **Rate Limit Usage**: Current API usage percentage

### Provider Health
- **Status**: Healthy/Degraded/Circuit Open
- **Latency**: Average response time
- **Success Rate**: Provider-specific success percentage

## 🧪 Testing

### Manual Testing
1. Use the dashboard form to send test emails
2. Monitor real-time stats and provider status
3. Check system logs for detailed operation tracking
4. Test idempotency by sending duplicate requests

### Load Testing
```bash
# Send multiple emails to test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/emails/send \
    -H "Content-Type: application/json" \
    -d '{
      "recipient": "test'$i'@example.com",
      "subject": "Load Test '$i'",
      "message": "Testing load handling",
      "priority": "normal"
    }'
done
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

### Service Configuration
- **Rate Limit**: 100 emails per minute
- **Circuit Breaker**: 5 failures trigger open state
- **Queue Processing**: 1-second intervals
- **Retry Attempts**: Maximum 3 per email

## 📦 Dependencies

### Production
- **express**: Web framework
- **drizzle-orm**: Type-safe ORM
- **zod**: Schema validation
- **uuid**: Unique ID generation
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing

### Development
- **typescript**: Type checking
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **tailwindcss**: CSS framework
- **@radix-ui**: Headless UI components

## 🎯 SOLID Principles

### Single Responsibility
- `EmailService`: Email orchestration only
- `CircuitBreaker`: Failure detection and recovery
- `RateLimiter`: Request rate management
- `EmailQueue`: Queue operations

### Open/Closed
- `EmailProvider` interface allows new provider implementations
- `IStorage` interface supports different storage backends

### Dependency Inversion
- Services depend on abstractions (`IStorage`, `EmailProvider`)
- Concrete implementations injected via constructor

## 🚦 Error Handling

### API Errors
- **400**: Validation errors with detailed field messages
- **500**: Internal server errors with descriptive messages
- **Rate Limit**: 429 with retry-after information

### Service Errors
- Circuit breaker prevents cascading failures
- Graceful degradation with provider fallback
- Comprehensive logging for debugging

## 📈 Performance

### Optimizations
- In-memory storage for fast access
- Efficient queue processing with priority sorting
- Real-time dashboard updates (30s intervals)
- Provider health caching

### Scalability Considerations
- Stateless service design
- Database-ready storage interface
- Horizontal scaling support
- Queue-based architecture

## 🔒 Security

### Idempotency
- Header-based duplicate prevention
- Unique key validation
- Safe retry operations

### Rate Limiting
- Per-service rate limiting
- Sliding window algorithm
- Configurable limits

## 📝 Assumptions

1. **Mock Providers**: Real email providers would require API keys and different error handling
2. **In-Memory Storage**: Production would use PostgreSQL or similar database
3. **Single Instance**: Horizontal scaling would require distributed queue/state
4. **Development Focus**: Optimized for demonstration rather than production deployment

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live dashboard refreshing
- **Professional Theme**: Clean, modern interface
- **Interactive Forms**: Validation and error handling
- **Status Indicators**: Visual system health monitoring

## 🚀 Deployment

### Production Considerations
1. Replace in-memory storage with PostgreSQL
2. Add authentication and authorization
3. Configure environment-specific settings
4. Set up monitoring and alerting
5. Implement distributed circuit breaker state
6. Add comprehensive logging and metrics

### Docker Support (Future)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For questions or issues:
1. Check the system logs in the dashboard
2. Review API response messages
3. Verify rate limiting status
4. Monitor provider health status

---

**Built with TypeScript, React, and modern web technologies for maximum reliability and developer experience.**# ResilientMailer-test
# ResilientMailer-test
