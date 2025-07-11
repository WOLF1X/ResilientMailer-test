# Email Service Application

## Overview

This is a resilient email service application built with a modern full-stack architecture. The system provides email sending capabilities with retry mechanisms, circuit breakers, rate limiting, and real-time monitoring through a comprehensive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling
- **UI Theme**: New York style from shadcn/ui with neutral base color

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Key Design Patterns
- **Circuit Breaker Pattern**: Prevents cascading failures across email providers
- **Queue Pattern**: Manages email processing with priority handling
- **Rate Limiting**: Controls API usage to prevent abuse
- **Retry Logic**: Automatic retry mechanism for failed email sends
- **Provider Failover**: Multiple email providers with automatic switching

## Key Components

### Email Service Core
- **EmailService**: Main orchestrator handling email sending, queuing, and provider management
- **CircuitBreaker**: Monitors provider health and prevents calls to failing providers
- **EmailQueue**: Priority-based queue system for managing email delivery
- **RateLimiter**: Token bucket implementation for API rate limiting
- **MockEmailProviders**: Simulated email providers (A & B) with different latency and failure rates

### Storage Layer
- **IStorage Interface**: Abstraction for data persistence operations
- **MemStorage**: In-memory implementation for development/testing
- **Database Schema**: Comprehensive schema covering emails, logs, stats, and user management

### Dashboard Components
- **StatsGrid**: Real-time metrics display (emails sent, success rate, queue size, rate limits)
- **ProviderStatus**: Health monitoring for email providers
- **EmailHistory**: Recent email delivery history with status tracking
- **SystemLogs**: Real-time log streaming with filtering capabilities
- **SendEmailForm**: Form for sending emails with validation

## Data Flow

1. **Email Submission**: User submits email through dashboard form
2. **Validation**: Zod schema validates email data structure
3. **Rate Limiting**: System checks if request is within rate limits
4. **Queuing**: Email added to priority queue based on urgency
5. **Provider Selection**: Circuit breaker determines healthy provider
6. **Delivery Attempt**: Email sent through selected provider
7. **Result Handling**: Success/failure logged, retries scheduled if needed
8. **Dashboard Update**: Real-time metrics updated via React Query

### Circuit Breaker States
- **Closed**: Normal operation, all requests pass through
- **Open**: Provider failure threshold exceeded, requests blocked
- **Half-Open**: Limited requests allowed to test provider recovery

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database client for PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web framework for REST API
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight client-side routing

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation library

### Development Dependencies
- **typescript**: Type checking and development experience
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Vite development server with HMR for frontend
- tsx for running TypeScript server with hot reload
- In-memory storage for rapid development iteration

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code with external dependencies
- Database: Drizzle migrations manage schema changes
- Environment: Production environment variables for database connection

### Database Management
- **Migrations**: Stored in `/migrations` directory
- **Schema**: Centralized in `shared/schema.ts` for type safety
- **Connection**: Environment-based DATABASE_URL configuration
- **Deployment**: `db:push` command applies schema changes

### Monitoring & Observability
- Real-time dashboard with 30-second refresh intervals
- Comprehensive logging system with different severity levels
- Provider health monitoring with automatic failover
- Circuit breaker status tracking for system reliability