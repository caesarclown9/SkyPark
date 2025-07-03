# Sky Park Development Workflow

## 1. Development Environment Setup

### 1.1 Prerequisites
```bash
# Required tools
- Node.js 18+ 
- Go 1.22+
- Docker & Docker Compose
- Git
- Visual Studio Code (recommended)

# Windows specific (PowerShell)
- Windows Terminal
- WSL2 (optional but recommended)
```

### 1.2 Repository Setup
```powershell
# Clone repository
git clone https://github.com/skypark/skypark.git
cd skypark

# Install dependencies
npm install

# Setup environment variables
Copy-Item .env.example .env.local
# Edit .env.local with your local configuration

# Start development environment
npm run dev
```

### 1.3 Local Development Stack
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15.5
    environment:
      POSTGRES_DB: skypark_dev
      POSTGRES_USER: skypark
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7.2
    ports:
      - "6379:6379"
      
  rabbitmq:
    image: rabbitmq:3.12-management
    environment:
      RABBITMQ_DEFAULT_USER: skypark
      RABBITMQ_DEFAULT_PASS: password
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres_data:
```

## 2. Git Workflow

### 2.1 Branch Strategy
```
main
├── develop                    # Integration branch
├── feature/ticket-purchase    # Feature branches
├── feature/loyalty-system
├── bugfix/qr-scanning-issue   # Bug fixes
├── hotfix/payment-gateway     # Critical fixes
└── release/v1.0.0            # Release branches
```

### 2.2 Commit Convention
```bash
# Format: type(scope): description

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples:
feat(auth): add phone number registration
fix(tickets): resolve QR code generation issue
docs(api): update endpoint documentation
test(payment): add unit tests for ELQR provider
```

### 2.3 Pull Request Process
```markdown
# PR Template
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 3. Code Quality Standards

### 3.1 Frontend (TypeScript/React)
```typescript
// ESLint configuration (.eslintrc.js)
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/exhaustive-deps': 'error',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal'],
      'newlines-between': 'always'
    }]
  }
};

// Prettier configuration (.prettierrc)
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 3.2 Backend (Go)
```bash
# Go formatting and linting
go fmt ./...
go vet ./...
golangci-lint run

# Test coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### 3.3 Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.go": [
      "gofmt -s -w",
      "go vet",
      "git add"
    ]
  }
}
```

## 4. Testing Strategy

### 4.1 Test Pyramid
```
     E2E Tests (10%)
    ────────────────
   Integration (20%)
  ────────────────────
 Unit Tests (70%)
──────────────────────
```

### 4.2 Frontend Testing
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketCard } from './TicketCard';

describe('TicketCard', () => {
  const mockTicket = {
    id: '123',
    parkName: 'Ала-Арча',
    visitDate: '2024-03-15',
    status: 'active',
    children: [{ name: 'Айгерим', age: 5 }]
  };

  it('should display ticket information', () => {
    render(<TicketCard ticket={mockTicket} onShowQR={() => {}} />);
    
    expect(screen.getByText('Ала-Арча')).toBeInTheDocument();
    expect(screen.getByText('Айгерим (5)')).toBeInTheDocument();
  });

  it('should call onShowQR when button clicked', () => {
    const onShowQR = jest.fn();
    render(<TicketCard ticket={mockTicket} onShowQR={onShowQR} />);
    
    fireEvent.click(screen.getByText('Показать QR код'));
    expect(onShowQR).toHaveBeenCalled();
  });
});
```

### 4.3 Backend Testing
```go
// Service test example
func TestTicketService_CreateTicket(t *testing.T) {
    // Setup
    db := setupTestDB(t)
    defer db.Close()
    
    repo := repository.NewTicketRepository(db)
    service := NewTicketService(repo)
    
    // Test data
    req := CreateTicketRequest{
        UserID:    uuid.New(),
        ParkID:    "ala-archa",
        VisitDate: time.Now().AddDate(0, 0, 1),
        Children: []TicketChild{
            {Name: "Айгерим", Age: 5},
        },
    }
    
    // Execute
    ticket, err := service.CreateTicket(context.Background(), req)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, ticket)
    assert.Equal(t, req.ParkID, ticket.ParkID)
    assert.NotEmpty(t, ticket.QRCode)
}
```

### 4.4 E2E Testing
```typescript
// Playwright test example
import { test, expect } from '@playwright/test';

test('ticket purchase flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid=phone]', '996555123456');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');
  
  // Navigate to ticket purchase
  await page.click('[data-testid=buy-ticket-button]');
  
  // Select park
  await page.click('[data-testid=park-ala-archa]');
  
  // Select date
  await page.click('[data-testid=tomorrow-button]');
  
  // Add children
  await page.click('[data-testid=add-child-button]');
  await page.fill('[data-testid=child-name]', 'Айгерим');
  await page.selectOption('[data-testid=child-age]', '5');
  
  // Proceed to payment
  await page.click('[data-testid=proceed-payment]');
  
  // Select payment method
  await page.click('[data-testid=payment-visa]');
  
  // Complete purchase
  await page.click('[data-testid=complete-purchase]');
  
  // Verify success
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: '1.22'
      
      - run: go mod download
      - run: go vet ./...
      - run: go test -race -coverprofile=coverage.out ./...
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-and-deploy:
    needs: [test-frontend, test-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t skypark/web:${{ github.sha }} apps/web
          docker build -t skypark/api:${{ github.sha }} apps/api
      
      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker push skypark/web:${{ github.sha }}
          docker push skypark/api:${{ github.sha }}
      
      - name: Deploy to production
        run: |
          kubectl set image deployment/skypark-web skypark-web=skypark/web:${{ github.sha }} -n skypark
          kubectl set image deployment/skypark-api skypark-api=skypark/api:${{ github.sha }} -n skypark
          kubectl rollout status deployment/skypark-web -n skypark
          kubectl rollout status deployment/skypark-api -n skypark
```

## 6. Code Review Guidelines

### 6.1 Review Checklist
```markdown
## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Naming conventions are followed
- [ ] No code duplication
- [ ] Comments explain complex logic

### Testing
- [ ] Unit tests cover new code
- [ ] Tests are meaningful and comprehensive
- [ ] Manual testing was performed

### Security
- [ ] No sensitive data in code
- [ ] Input validation is present
- [ ] SQL injection prevention
- [ ] XSS prevention

### Documentation
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] Comments added for complex logic
```

### 6.2 Review Process
```bash
# Reviewer workflow
1. git checkout feature/branch-name
2. npm install && npm run build
3. npm run test
4. Manual testing of changes
5. Review code for quality and security
6. Approve or request changes
```

## 7. Release Management

### 7.1 Versioning Strategy
```bash
# Semantic Versioning (MAJOR.MINOR.PATCH)
v1.0.0 - Initial release
v1.0.1 - Bug fixes
v1.1.0 - New features (backward compatible)
v2.0.0 - Breaking changes
```

### 7.2 Release Process
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# Update version numbers
npm version 1.1.0
git commit -am "Bump version to 1.1.0"

# Final testing
npm run test:all
npm run e2e:production

# Merge to main
git checkout main
git merge release/v1.1.0
git tag v1.1.0
git push origin main --tags

# Deploy to production
./scripts/deploy-production.sh v1.1.0

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

### 7.3 Rollback Procedure
```bash
# Emergency rollback
kubectl rollout undo deployment/skypark-api -n skypark
kubectl rollout undo deployment/skypark-web -n skypark

# Verify rollback
kubectl rollout status deployment/skypark-api -n skypark
kubectl get pods -n skypark

# Update DNS if needed
# Monitor application health
```

## 8. Documentation Standards

### 8.1 Code Documentation
```typescript
/**
 * Creates a new ticket for the specified park and date
 * 
 * @param userId - The ID of the user purchasing the ticket
 * @param parkId - The ID of the target park
 * @param visitDate - The date of the visit
 * @param children - Array of children information
 * @returns Promise resolving to the created ticket
 * 
 * @throws {ValidationError} When input data is invalid
 * @throws {CapacityError} When park is at full capacity
 * 
 * @example
 * ```typescript
 * const ticket = await createTicket(userId, 'ala-archa', new Date(), [
 *   { name: 'Айгерим', age: 5 }
 * ]);
 * ```
 */
async function createTicket(
  userId: string,
  parkId: string,
  visitDate: Date,
  children: ChildInfo[]
): Promise<Ticket> {
  // Implementation
}
```

### 8.2 API Documentation
```yaml
# Update OpenAPI spec for each API change
# Generate documentation: npm run docs:generate
# Deploy docs: npm run docs:deploy
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Development Team 
 