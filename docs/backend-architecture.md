# Sky Park Backend Architecture

## 1. System Overview

### 1.1 Architecture Pattern
**Pattern**: Modular Monolith with Event Sourcing  
**Rationale**: Simplifies deployment while maintaining clear boundaries for future microservices migration

### 1.2 Core Principles
- **Offline-First**: Event sourcing enables operation during network outages
- **CQRS**: Separate read/write models for optimal performance
- **Domain-Driven Design**: Clear business domain boundaries
- **Resilience**: Circuit breakers and graceful degradation

## 2. Technology Stack

### 2.1 Core Technologies
```yaml
Language: Go 1.22
Framework: Gin 1.9.1
Database: PostgreSQL 15.5
Cache: Redis 7.2
Queue: RabbitMQ 3.12
Storage: MinIO (S3-compatible)
```

### 2.2 Supporting Technologies
```yaml
Authentication: JWT + Refresh tokens
Monitoring: Prometheus + Grafana
Logging: Structured logging with slog
Testing: Go built-in testing + Testify
API Documentation: Swagger/OpenAPI 3.0
```

## 3. Project Structure

```
skypark-api/
├── cmd/
│   ├── api/                    # Main API server
│   ├── worker/                 # Background job processor
│   └── migrate/                # Database migrations
├── internal/
│   ├── auth/                   # Authentication domain
│   ├── booking/                # Ticket booking domain
│   ├── payment/                # Payment processing domain
│   ├── loyalty/                # Loyalty program domain
│   ├── park/                   # Park management domain
│   ├── user/                   # User management domain
│   ├── common/                 # Shared utilities
│   └── infrastructure/         # External integrations
├── pkg/
│   ├── middleware/             # HTTP middleware
│   ├── validator/              # Input validation
│   ├── logger/                 # Logging utilities
│   └── crypto/                 # Cryptographic utilities
├── migrations/                 # Database schema migrations
├── scripts/                    # Deployment scripts
└── docker/                     # Docker configurations
```

## 4. Domain Architecture

### 4.1 User Domain
```go
package user

type User struct {
    ID            uuid.UUID `db:"id" json:"id"`
    Phone         string    `db:"phone" json:"phone"`
    Email         *string   `db:"email" json:"email,omitempty"`
    Name          string    `db:"name" json:"name"`
    PasswordHash  string    `db:"password_hash" json:"-"`
    LoyaltyPoints int       `db:"loyalty_points" json:"loyalty_points"`
    LoyaltyTier   string    `db:"loyalty_tier" json:"loyalty_tier"`
    Language      string    `db:"language" json:"language"`
    CreatedAt     time.Time `db:"created_at" json:"created_at"`
    UpdatedAt     time.Time `db:"updated_at" json:"updated_at"`
}

type Child struct {
    ID        uuid.UUID  `db:"id" json:"id"`
    UserID    uuid.UUID  `db:"user_id" json:"user_id"`
    Name      string     `db:"name" json:"name"`
    BirthDate time.Time  `db:"birth_date" json:"birth_date"`
    Gender    *string    `db:"gender" json:"gender,omitempty"`
    PhotoURL  *string    `db:"photo_url" json:"photo_url,omitempty"`
    CreatedAt time.Time  `db:"created_at" json:"created_at"`
}
```

### 4.2 Booking Domain
```go
package booking

type Ticket struct {
    ID           uuid.UUID  `db:"id" json:"id"`
    UserID       uuid.UUID  `db:"user_id" json:"user_id"`
    ParkID       string     `db:"park_id" json:"park_id"`
    TicketType   string     `db:"ticket_type" json:"ticket_type"`
    VisitDate    time.Time  `db:"visit_date" json:"visit_date"`
    QRCode       string     `db:"qr_code" json:"qr_code"`
    Status       string     `db:"status" json:"status"`
    Price        decimal.Decimal `db:"price" json:"price"`
    ChildrenData JSONB      `db:"children_data" json:"children_data"`
    CreatedAt    time.Time  `db:"created_at" json:"created_at"`
    UsedAt       *time.Time `db:"used_at" json:"used_at,omitempty"`
}

type TicketService struct {
    repo     TicketRepository
    qrGen    QRGenerator
    events   EventStore
    payments PaymentService
}

func (s *TicketService) CreateTicket(ctx context.Context, req CreateTicketRequest) (*Ticket, error) {
    // 1. Validate park capacity
    if err := s.validateCapacity(req.ParkID, req.VisitDate); err != nil {
        return nil, err
    }
    
    // 2. Calculate pricing
    price := s.calculatePrice(req.Children)
    
    // 3. Create ticket
    ticket := &Ticket{
        ID:           uuid.New(),
        UserID:       req.UserID,
        ParkID:       req.ParkID,
        VisitDate:    req.VisitDate,
        Price:        price,
        ChildrenData: req.Children,
        Status:       "pending_payment",
    }
    
    // 4. Store event for offline sync
    event := NewTicketCreatedEvent(ticket)
    if err := s.events.Store(ctx, event); err != nil {
        return nil, err
    }
    
    return ticket, nil
}
```

### 4.3 Payment Domain
```go
package payment

type PaymentProvider interface {
    ProcessPayment(ctx context.Context, req PaymentRequest) (*PaymentResponse, error)
    GetPaymentStatus(ctx context.Context, paymentID string) (*PaymentStatus, error)
    RefundPayment(ctx context.Context, paymentID string, amount decimal.Decimal) error
}

type ELQRProvider struct {
    apiKey    string
    baseURL   string
    client    *http.Client
}

type ElCardProvider struct {
    clientID     string
    clientSecret string
    baseURL      string
    client       *http.Client
}

type PaymentService struct {
    providers map[string]PaymentProvider
    repo      PaymentRepository
    events    EventStore
}

func (s *PaymentService) ProcessPayment(ctx context.Context, req PaymentRequest) (*Payment, error) {
    provider, ok := s.providers[req.Method]
    if !ok {
        return nil, ErrUnsupportedPaymentMethod
    }
    
    // Process payment with provider
    resp, err := provider.ProcessPayment(ctx, req)
    if err != nil {
        return nil, err
    }
    
    // Store payment record
    payment := &Payment{
        ID:         uuid.New(),
        UserID:     req.UserID,
        Amount:     req.Amount,
        Method:     req.Method,
        Status:     resp.Status,
        ExternalID: resp.TransactionID,
    }
    
    // Store event
    event := NewPaymentProcessedEvent(payment)
    return payment, s.events.Store(ctx, event)
}
```

## 5. Event Sourcing Implementation

### 5.1 Event Store
```go
package events

type Event struct {
    ID            uuid.UUID       `db:"id" json:"id"`
    AggregateID   uuid.UUID       `db:"aggregate_id" json:"aggregate_id"`
    AggregateType string          `db:"aggregate_type" json:"aggregate_type"`
    EventType     string          `db:"event_type" json:"event_type"`
    EventData     json.RawMessage `db:"event_data" json:"event_data"`
    EventVersion  int             `db:"event_version" json:"event_version"`
    CreatedAt     time.Time       `db:"created_at" json:"created_at"`
    ParkID        *string         `db:"park_id" json:"park_id,omitempty"`
    Synced        bool            `db:"synced" json:"synced"`
}

type EventStore interface {
    Store(ctx context.Context, event Event) error
    Load(ctx context.Context, aggregateID uuid.UUID) ([]Event, error)
    LoadByType(ctx context.Context, eventType string, since time.Time) ([]Event, error)
}

type PostgreSQLEventStore struct {
    db *sql.DB
}

func (es *PostgreSQLEventStore) Store(ctx context.Context, event Event) error {
    query := `
        INSERT INTO events (id, aggregate_id, aggregate_type, event_type, 
                          event_data, event_version, park_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
    
    _, err := es.db.ExecContext(ctx, query,
        event.ID, event.AggregateID, event.AggregateType,
        event.EventType, event.EventData, event.EventVersion, event.ParkID)
    
    return err
}
```

### 5.2 CRDT for Conflict Resolution
```go
package crdt

type VectorClock map[string]int

type CRDTState struct {
    ID          string          `db:"id" json:"id"`
    NodeID      string          `db:"node_id" json:"node_id"`
    VectorClock VectorClock     `db:"vector_clock" json:"vector_clock"`
    Data        json.RawMessage `db:"data" json:"data"`
    UpdatedAt   time.Time       `db:"updated_at" json:"updated_at"`
}

func (vc VectorClock) Compare(other VectorClock) ConcurrentRelation {
    var thisGreater, otherGreater bool
    
    for node, thisVersion := range vc {
        otherVersion := other[node]
        if thisVersion > otherVersion {
            thisGreater = true
        } else if thisVersion < otherVersion {
            otherGreater = true
        }
    }
    
    for node, otherVersion := range other {
        if _, exists := vc[node]; !exists && otherVersion > 0 {
            otherGreater = true
        }
    }
    
    if thisGreater && otherGreater {
        return Concurrent
    } else if thisGreater {
        return Greater
    } else if otherGreater {
        return Less
    }
    return Equal
}
```

## 6. API Endpoints

### 6.1 Authentication Endpoints
```go
package auth

func (h *AuthHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    user, err := h.authService.Register(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    tokens, err := h.authService.GenerateTokens(user.ID)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(201, gin.H{
        "user":          user,
        "access_token":  tokens.AccessToken,
        "refresh_token": tokens.RefreshToken,
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    user, err := h.authService.Login(c.Request.Context(), req.Phone, req.Password)
    if err != nil {
        if errors.Is(err, ErrInvalidCredentials) {
            c.JSON(401, gin.H{"error": "Invalid credentials"})
            return
        }
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    tokens, err := h.authService.GenerateTokens(user.ID)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{
        "user":          user,
        "access_token":  tokens.AccessToken,
        "refresh_token": tokens.RefreshToken,
    })
}
```

### 6.2 Ticket Endpoints
```go
func (h *TicketHandler) CreateTicket(c *gin.Context) {
    userID := c.GetString("userID")
    
    var req CreateTicketRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    req.UserID = uuid.MustParse(userID)
    
    ticket, err := h.ticketService.CreateTicket(c.Request.Context(), req)
    if err != nil {
        if errors.Is(err, ErrParkAtCapacity) {
            c.JSON(409, gin.H{"error": "Park is at capacity"})
            return
        }
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(201, ticket)
}

func (h *TicketHandler) ValidateQR(c *gin.Context) {
    qrCode := c.Param("qrCode")
    
    ticket, err := h.ticketService.ValidateQR(c.Request.Context(), qrCode)
    if err != nil {
        if errors.Is(err, ErrTicketNotFound) {
            c.JSON(404, gin.H{"error": "Ticket not found"})
            return
        }
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{
        "valid":  true,
        "ticket": ticket,
    })
}
```

## 7. Middleware

### 7.1 Authentication Middleware
```go
package middleware

func AuthMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        
        tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
        
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return []byte(secret), nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        claims := token.Claims.(jwt.MapClaims)
        c.Set("userID", claims["sub"])
        c.Set("userPhone", claims["phone"])
        c.Next()
    }
}
```

### 7.2 Rate Limiting Middleware
```go
func RateLimitMiddleware(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        key := fmt.Sprintf("rate_limit:%s", c.ClientIP())
        
        count, err := rdb.Incr(c.Request.Context(), key).Result()
        if err != nil {
            c.Next()
            return
        }
        
        if count == 1 {
            rdb.Expire(c.Request.Context(), key, time.Minute)
        }
        
        if count > 100 { // 100 requests per minute
            c.JSON(429, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }
        
        c.Header("X-RateLimit-Remaining", strconv.Itoa(100-int(count)))
        c.Next()
    }
}
```

## 8. Database Schema

### 8.1 Core Tables
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'beginner',
    language VARCHAR(2) DEFAULT 'ru',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Children table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10),
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parks table
CREATE TABLE parks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    price_under_3 DECIMAL(10,2) NOT NULL,
    price_over_3 DECIMAL(10,2) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    amenities JSONB,
    images JSONB
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    park_id VARCHAR(50) REFERENCES parks(id),
    ticket_type VARCHAR(20) NOT NULL,
    visit_date DATE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    price DECIMAL(10,2) NOT NULL,
    children_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Events table for event sourcing
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    event_version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    park_id VARCHAR(50),
    synced BOOLEAN DEFAULT FALSE,
    UNIQUE(aggregate_id, event_version)
);
```

## 9. Configuration

### 9.1 Environment Configuration
```go
package config

type Config struct {
    Server   ServerConfig   `yaml:"server"`
    Database DatabaseConfig `yaml:"database"`
    Redis    RedisConfig    `yaml:"redis"`
    JWT      JWTConfig      `yaml:"jwt"`
    Payment  PaymentConfig  `yaml:"payment"`
}

type ServerConfig struct {
    Port         int    `yaml:"port" env:"PORT" default:"8080"`
    ReadTimeout  int    `yaml:"read_timeout" env:"READ_TIMEOUT" default:"30"`
    WriteTimeout int    `yaml:"write_timeout" env:"WRITE_TIMEOUT" default:"30"`
}

type DatabaseConfig struct {
    Host     string `yaml:"host" env:"DB_HOST" required:"true"`
    Port     int    `yaml:"port" env:"DB_PORT" default:"5432"`
    Name     string `yaml:"name" env:"DB_NAME" required:"true"`
    User     string `yaml:"user" env:"DB_USER" required:"true"`
    Password string `yaml:"password" env:"DB_PASSWORD" required:"true"`
    SSLMode  string `yaml:"ssl_mode" env:"DB_SSL_MODE" default:"disable"`
}

func Load() (*Config, error) {
    cfg := &Config{}
    
    if err := envconfig.Process("", cfg); err != nil {
        return nil, err
    }
    
    return cfg, nil
}
```

## 10. Testing Strategy

### 10.1 Unit Tests
```go
func TestTicketService_CreateTicket(t *testing.T) {
    // Setup
    repo := &mockTicketRepository{}
    eventStore := &mockEventStore{}
    service := NewTicketService(repo, eventStore)
    
    // Test data
    req := CreateTicketRequest{
        UserID:    uuid.New(),
        ParkID:    "ala-archa",
        VisitDate: time.Now().AddDate(0, 0, 1),
        Children: []TicketChild{
            {Name: "John", Age: 5},
        },
    }
    
    // Execute
    ticket, err := service.CreateTicket(context.Background(), req)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, ticket)
    assert.Equal(t, req.ParkID, ticket.ParkID)
    assert.True(t, repo.SaveCalled)
    assert.True(t, eventStore.StoreCalled)
}
```

### 10.2 Integration Tests
```go
func TestAPI_CreateTicket(t *testing.T) {
    // Setup test server
    db := setupTestDB(t)
    defer db.Close()
    
    server := setupTestServer(db)
    
    // Create test user
    user := createTestUser(t, db)
    token := generateTestToken(user.ID)
    
    // Test data
    payload := map[string]interface{}{
        "park_id":    "ala-archa",
        "visit_date": "2024-03-15",
        "children": []map[string]interface{}{
            {"name": "John", "age": 5},
        },
    }
    
    body, _ := json.Marshal(payload)
    
    // Execute request
    req := httptest.NewRequest("POST", "/api/v1/tickets", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")
    
    w := httptest.NewRecorder()
    server.ServeHTTP(w, req)
    
    // Assert
    assert.Equal(t, 201, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.NotEmpty(t, response["qr_code"])
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Backend Team 
 