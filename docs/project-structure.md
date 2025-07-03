# Sky Park Project Structure

## 1. Monorepo Overview

### 1.1 Repository Structure
```
skypark/
├── apps/                       # Applications
│   ├── web/                    # Next.js PWA
│   ├── mobile/                 # React Native app
│   ├── api/                    # Go backend
│   └── admin/                  # Admin dashboard
├── packages/                   # Shared packages
│   ├── shared/                 # Common types & utilities
│   ├── ui/                     # UI component library
│   └── config/                 # Shared configurations
├── infrastructure/             # Infrastructure as Code
│   ├── k3s/                    # Kubernetes manifests
│   ├── terraform/              # Infrastructure provisioning
│   └── docker/                 # Docker configurations
├── docs/                       # Documentation
├── scripts/                    # Build & deployment scripts
└── tools/                      # Development tools
```

## 2. Frontend Applications

### 2.1 Web PWA (apps/web)
```
apps/web/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/                 # Main app routes
│   │   ├── page.tsx            # Home page
│   │   ├── parks/
│   │   │   ├── page.tsx        # Parks list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Park details
│   │   ├── tickets/
│   │   │   ├── buy/
│   │   │   │   ├── page.tsx    # Ticket purchase
│   │   │   │   ├── park/
│   │   │   │   ├── date/
│   │   │   │   ├── children/
│   │   │   │   ├── payment/
│   │   │   │   └── success/
│   │   │   └── my-tickets/
│   │   │       ├── page.tsx    # User tickets
│   │   │       └── [id]/
│   │   │           └── page.tsx # QR display
│   │   └── profile/
│   │       ├── page.tsx        # User profile
│   │       ├── children/
│   │       └── loyalty/
│   ├── api/                    # API routes (if needed)
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   └── loading.tsx
├── components/                 # React components
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── features/               # Feature components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── tickets/
│   │   │   ├── ticket-card.tsx
│   │   │   ├── qr-display.tsx
│   │   │   └── purchase-flow/
│   │   ├── parks/
│   │   │   ├── park-card.tsx
│   │   │   └── park-carousel.tsx
│   │   └── loyalty/
│   │       ├── points-display.tsx
│   │       └── tier-badge.tsx
│   └── layout/                 # Layout components
│       ├── header.tsx
│       ├── bottom-nav.tsx
│       └── sidebar.tsx
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts
│   ├── use-tickets.ts
│   ├── use-parks.ts
│   └── use-local-storage.ts
├── lib/                        # Utilities & configurations
│   ├── api-client.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── validations.ts
├── services/                   # API service layer
│   ├── auth-service.ts
│   ├── ticket-service.ts
│   ├── park-service.ts
│   └── payment-service.ts
├── stores/                     # Zustand stores
│   ├── auth-store.ts
│   ├── ticket-store.ts
│   ├── ui-store.ts
│   └── offline-store.ts
├── styles/                     # Global styles
│   ├── globals.css
│   └── components.css
├── public/                     # Static assets
│   ├── icons/
│   ├── images/
│   └── manifest.json
├── __tests__/                  # Test files
│   ├── components/
│   ├── hooks/
│   └── services/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 2.2 Mobile App (apps/mobile)
```
apps/mobile/
├── src/
│   ├── components/             # React Native components
│   │   ├── ui/                 # Base components
│   │   └── features/           # Feature components
│   ├── screens/                # Screen components
│   │   ├── AuthStack/
│   │   ├── MainStack/
│   │   └── TicketStack/
│   ├── navigation/             # React Navigation
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/               # API services
│   ├── stores/                 # State management
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utilities
│   └── types/                  # TypeScript types
├── android/                    # Android-specific code
├── ios/                        # iOS-specific code
├── __tests__/
├── metro.config.js
├── react-native.config.js
└── package.json
```

## 3. Backend API (apps/api)

### 3.1 Go Backend Structure
```
apps/api/
├── cmd/                        # Entry points
│   ├── api/                    # Main API server
│   │   └── main.go
│   ├── worker/                 # Background worker
│   │   └── main.go
│   └── migrate/                # Database migrations
│       └── main.go
├── internal/                   # Private application code
│   ├── auth/                   # Authentication domain
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── models.go
│   ├── booking/                # Ticket booking domain
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── models.go
│   ├── payment/                # Payment processing
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── providers/          # Payment providers
│   │   │   ├── elqr.go
│   │   │   ├── elcard.go
│   │   │   └── mbank.go
│   │   └── models.go
│   ├── loyalty/                # Loyalty program
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── models.go
│   ├── park/                   # Park management
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── models.go
│   ├── user/                   # User management
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── models.go
│   ├── common/                 # Shared utilities
│   │   ├── database/
│   │   ├── redis/
│   │   ├── queue/
│   │   └── events/
│   └── infrastructure/         # External integrations
│       ├── sms/
│       ├── email/
│       └── storage/
├── pkg/                        # Public packages
│   ├── middleware/             # HTTP middleware
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── rate_limit.go
│   │   └── logging.go
│   ├── validator/              # Input validation
│   │   └── validator.go
│   ├── logger/                 # Structured logging
│   │   └── logger.go
│   ├── crypto/                 # Cryptographic utilities
│   │   └── crypto.go
│   └── config/                 # Configuration
│       └── config.go
├── migrations/                 # Database migrations
│   ├── 001_initial_schema.up.sql
│   ├── 001_initial_schema.down.sql
│   ├── 002_add_indexes.up.sql
│   └── 002_add_indexes.down.sql
├── scripts/                    # Utility scripts
│   ├── seed.go
│   └── cleanup.go
├── tests/                      # Test files
│   ├── integration/
│   └── unit/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── go.mod
├── go.sum
└── Makefile
```

## 4. Shared Packages

### 4.1 Shared Types (packages/shared)
```
packages/shared/
├── src/
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── ticket.ts
│   │   ├── park.ts
│   │   ├── user.ts
│   │   ├── payment.ts
│   │   └── index.ts
│   ├── constants/              # Application constants
│   │   ├── parks.ts
│   │   ├── pricing.ts
│   │   ├── loyalty.ts
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   └── schemas/                # Validation schemas
│       ├── auth.ts
│       ├── ticket.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 4.2 UI Component Library (packages/ui)
```
packages/ui/
├── src/
│   ├── components/             # Reusable components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── hooks/                  # Shared hooks
│   │   ├── useTheme.ts
│   │   └── index.ts
│   ├── utils/                  # UI utilities
│   │   ├── cn.ts
│   │   └── index.ts
│   └── styles/                 # Shared styles
│       ├── globals.css
│       └── components.css
├── .storybook/                 # Storybook configuration
├── package.json
└── tsconfig.json
```

## 5. Infrastructure

### 5.1 Kubernetes Manifests (infrastructure/k3s)
```
infrastructure/k3s/
├── base/                       # Base configurations
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   └── kustomization.yaml
├── apps/                       # Application deployments
│   ├── api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   └── hpa.yaml
│   ├── web/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── worker/
│       ├── deployment.yaml
│       └── cronjob.yaml
├── databases/                  # Database configurations
│   ├── postgresql/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   ├── redis/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── rabbitmq/
│       ├── statefulset.yaml
│       └── service.yaml
├── monitoring/                 # Monitoring stack
│   ├── prometheus/
│   ├── grafana/
│   └── loki/
├── overlays/                   # Environment-specific configs
│   ├── development/
│   ├── staging/
│   └── production/
└── scripts/
    ├── deploy.sh
    └── rollback.sh
```

### 5.2 Terraform (infrastructure/terraform)
```
infrastructure/terraform/
├── modules/                    # Reusable modules
│   ├── k3s-cluster/
│   ├── database/
│   └── monitoring/
├── environments/               # Environment configurations
│   ├── development/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
├── providers.tf
├── variables.tf
└── outputs.tf
```

## 6. Development Tools

### 6.1 Build Tools Configuration
```javascript
// nx.json - Nx workspace configuration
{
  "extends": "nx/presets/npm.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    }
  }
}
```

### 6.2 Package Scripts
```json
{
  "scripts": {
    "dev": "nx run-many --target=serve --projects=web,api --parallel",
    "dev:web": "nx serve web",
    "dev:api": "nx serve api",
    "dev:mobile": "nx run mobile:start",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all",
    "lint": "nx run-many --target=lint --all",
    "e2e": "nx run-many --target=e2e --all",
    "docker:build": "nx run-many --target=docker-build --all",
    "docker:up": "docker-compose up -d",
    "k8s:deploy": "./scripts/deploy.sh",
    "db:migrate": "nx run api:migrate",
    "db:seed": "nx run api:seed"
  }
}
```

## 7. Configuration Management

### 7.1 Environment Variables
```bash
# .env.example
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/skypark
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Payment Providers
ELQR_API_KEY=your-elqr-key
ELCARD_CLIENT_ID=your-elcard-id
MBANK_API_KEY=your-mbank-key

# External Services
SMS_PROVIDER_URL=https://sms.provider.kg
EMAIL_SERVICE_KEY=your-email-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
PROMETHEUS_URL=http://localhost:9090
```

### 7.2 Build Configuration
```typescript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.skypark.kg', 'cdn.skypark.kg'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/v1/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

## 8. Testing Structure

### 8.1 Test Organization
```
tests/
├── unit/                       # Unit tests
│   ├── frontend/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── backend/
│       ├── handlers/
│       ├── services/
│       └── repositories/
├── integration/                # Integration tests
│   ├── api/
│   └── database/
├── e2e/                        # End-to-end tests
│   ├── auth.spec.ts
│   ├── ticket-purchase.spec.ts
│   └── loyalty.spec.ts
├── fixtures/                   # Test data
│   ├── users.json
│   ├── parks.json
│   └── tickets.json
└── utils/                      # Test utilities
    ├── test-server.ts
    ├── mock-data.ts
    └── setup.ts
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Architecture Team 
 