# GOOD LIFE Booking System - Devine.io Implementation

Complete migration from n8n to Devine.io Workflow Runtime for LINE-based booking reservation system with AI conversation handling, payment integration, and comprehensive monitoring.

## 🏗️ Architecture Overview

```
UX Layer          → LINE Official Account (Messaging API)
Workflow Layer    → Devine.io Workflow Runtime (TypeScript)
Scheduler Layer   → Google Calendar API (Availability Management)
Database Layer    → Supabase Postgres + RLS (Data Management)
Payment Layer     → Square Checkout API + Webhooks
Monitoring Layer  → Slack Notifications + Integrity Checks
```

## 🚀 Key Features

- **3-Step Booking Experience**: LINE Quick Reply interface for seamless reservations
- **AI-Powered Conversations**: LangChain integration for natural language processing
- **Zero Double-Booking**: Race condition prevention with database locking
- **Real-time Payment Processing**: Square Checkout with webhook validation
- **Automated Monitoring**: 5-minute consistency checks between Calendar and Database
- **Comprehensive Error Handling**: Retry mechanisms and manual override capabilities

## 📊 Performance Requirements (KPIs)

- ✅ **Double-booking Rate**: 0%
- ✅ **Booking Confirmation Time**: ≤ 15 seconds
- ✅ **AI Response Time**: ≤ 1 second
- ✅ **Edge Transaction Time**: ≤ 500ms
- ✅ **Webhook Retry Correction**: < 5 minutes
- 🎯 **Target NPS**: ≥ 50

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Workflow Runtime | Devine.io | Serverless workflow orchestration |
| Database | Supabase Postgres + RLS | Secure data management |
| AI/Conversation | LangChain + LangGraph | Intent classification & responses |
| External APIs | LINE, Google Calendar, Square | Core integrations |
| Testing | Jest + Playwright + k6 | Unit, E2E, and load testing |
| Infrastructure | Devine Runtime (Tokyo) | Low-latency execution |

## 📁 Project Structure

```
├── src/
│   ├── ai/                     # AI conversation handling
│   ├── config/                 # Environment configuration
│   ├── monitoring/             # Integrity checking
│   ├── services/               # External API integrations
│   ├── types/                  # TypeScript definitions
│   └── workflows/              # Devine.io workflow logic
├── database/
│   └── schema.sql              # Supabase database schema
├── workflows/
│   ├── booking-webhook.json    # LINE webhook workflow
│   ├── payment-webhook.json    # Square payment workflow
│   └── consistency-check.json  # Scheduled integrity checks
├── tests/
│   ├── *.test.ts              # Unit tests
│   └── e2e/                   # End-to-end tests
└── .github/workflows/         # CI/CD pipeline
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# Google Calendar API
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Square Payment API
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_APPLICATION_ID=your-square-application-id
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SECRET=your-square-webhook-secret

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Devine.io Configuration
DEVINE_API_KEY=your-devine-api-key
DEVINE_WORKSPACE_ID=your-workspace-id
```

### 2. Database Setup

Execute the database schema in your Supabase project:

```sql
-- Run the contents of database/schema.sql in your Supabase SQL editor
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build and Test

```bash
# Build TypeScript
npm run build

# Run unit tests
npm run test

# Run E2E tests (after deployment)
npm run test:e2e
```

### 5. Deploy to Devine.io

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy
```

## 🔗 API Integrations

### LINE Messaging API
- **Webhook Endpoint**: `/webhook/line`
- **Features**: Message handling, Quick Reply, Rich Menu
- **Security**: HMAC signature validation

### Google Calendar API
- **Service Account**: Required for calendar access
- **Event Format**: `GLJ_YYYYMMDD_枠ID` naming convention
- **Capacity Management**: Extended properties for current/max capacity

### Square Checkout API
- **Environment**: Sandbox for testing, Production for live
- **Webhook Endpoint**: `/webhook/square`
- **Security**: Webhook signature validation
- **Features**: Payment link generation, status tracking

### Supabase Database
- **Tables**: `users`, `reservations`, `payments`
- **Security**: Row Level Security (RLS) policies
- **Features**: Real-time subscriptions, Edge Functions

## 🔄 Workflow Definitions

### 1. Booking Webhook (`workflows/booking-webhook.json`)
Handles incoming LINE messages and orchestrates the booking process:
- Signature validation
- Message parsing
- AI conversation handling
- Availability checking
- Reservation creation

### 2. Payment Webhook (`workflows/payment-webhook.json`)
Processes Square payment notifications:
- Payment status updates
- Reservation confirmation
- Customer notifications
- Error handling

### 3. Consistency Check (`workflows/consistency-check.json`)
Scheduled integrity monitoring (every 5 minutes):
- Calendar ↔ Database synchronization
- Inconsistency detection
- Slack alerting
- Manual override triggers

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test
```
- Service class instantiation
- Interface validation
- Mock external dependencies

### E2E Tests
```bash
npm run test:e2e
```
- Complete booking flow
- Payment processing
- Error scenarios

### Load Testing
```bash
npm run test:load
```
- k6 performance testing
- Edge transaction timing
- Concurrent booking scenarios

## 📈 Monitoring & Alerting

### Integrity Checking
- **Frequency**: Every 5 minutes
- **Scope**: Calendar ↔ Database consistency
- **Actions**: Automatic correction + Slack alerts

### Error Handling
- **Retry Logic**: Maximum 3 attempts for webhook failures
- **Manual Override**: Emergency correction UI
- **Logging**: Comprehensive error tracking

### Performance Monitoring
- **Metrics**: Response times, success rates, error counts
- **Alerting**: Slack notifications for threshold breaches
- **Dashboards**: Devine.io built-in monitoring

## 🚦 Deployment Pipeline

### CI/CD Workflow (`.github/workflows/ci.yml`)
1. **Build**: TypeScript compilation
2. **Test**: Unit and integration tests
3. **Lint**: Code quality checks
4. **Deploy**: Devine.io deployment via API

### Environment Strategy
- **Development**: Local testing with mocked services
- **Staging**: Devine.io staging workspace + LINE staging channel
- **Production**: Devine.io production workspace + live integrations

## 🔒 Security Considerations

### Data Protection
- **RLS Policies**: Row-level security for all database tables
- **Webhook Validation**: HMAC signature verification
- **Secret Management**: Devine Vault for sensitive credentials

### Error Handling
- **No Data Exposure**: Sanitized error messages
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: Protection against abuse

## 📋 Migration from n8n

### Mapping Guide
| n8n Component | Devine.io Equivalent |
|---------------|---------------------|
| Webhook Node | Devine Webhook Node |
| Function Node | TypeScript Step |
| IF Node | TypeScript Conditional |
| Cron Trigger | Scheduled Runs |
| HTTP Request | TypeScript fetch |

### Migration Steps
1. Export n8n workflow definitions
2. Convert to Devine.io TypeScript steps
3. Test individual components
4. Deploy and validate end-to-end flow
5. Monitor and optimize performance

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Test Failures**
```bash
# Check environment variables in tests/setup.ts
# Ensure all mock values are properly configured
```

**Webhook Failures**
- Verify signature validation
- Check endpoint accessibility
- Review retry logic configuration

**Database Connection Issues**
- Validate Supabase credentials
- Check RLS policies
- Verify service role permissions

## 📞 Support

For technical issues or questions:
1. Check the troubleshooting section above
2. Review Devine.io documentation
3. Contact the development team via Slack
4. Create GitHub issues for bugs or feature requests

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for GOOD LIFE booking system**
Devine.io deploy repository for GOOD LIFE booking workflow
