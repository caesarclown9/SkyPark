# Sky Park API Specification

## 1. OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Sky Park API
  version: 1.0.0
  description: API for Sky Park digital ticketing system
  contact:
    name: Sky Park Development Team
    email: dev@skypark.kg
servers:
  - url: https://api.skypark.kg/v1
    description: Production server
  - url: https://staging-api.skypark.kg/v1
    description: Staging server
  - url: http://localhost:8080/v1
    description: Development server

paths:
  # Authentication Endpoints
  /auth/register:
    post:
      summary: Register new user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [phone, password, name]
              properties:
                phone:
                  type: string
                  pattern: '^996\d{9}$'
                  example: "996555123456"
                password:
                  type: string
                  minLength: 8
                  example: "securepass123"
                name:
                  type: string
                  minLength: 2
                  example: "Айгуль Жумабекова"
                email:
                  type: string
                  format: email
                  example: "aigul@example.kg"
                language:
                  type: string
                  enum: [ru, ky]
                  default: ru
      responses:
        201:
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        400:
          description: Validation error
        409:
          description: Phone number already exists

  /auth/login:
    post:
      summary: Login user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [phone, password]
              properties:
                phone:
                  type: string
                  pattern: '^996\d{9}$'
                password:
                  type: string
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        401:
          description: Invalid credentials

  /auth/refresh:
    post:
      summary: Refresh access token
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refresh_token]
              properties:
                refresh_token:
                  type: string
      responses:
        200:
          description: Token refreshed
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  expires_in:
                    type: integer

  # Parks Endpoints
  /parks:
    get:
      summary: List all parks
      tags: [Parks]
      parameters:
        - name: include_capacity
          in: query
          schema:
            type: boolean
            default: true
      responses:
        200:
          description: Parks list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Park'

  /parks/{parkId}:
    get:
      summary: Get park details
      tags: [Parks]
      parameters:
        - name: parkId
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Park details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ParkDetails'

  /parks/{parkId}/availability:
    get:
      summary: Check park availability for date
      tags: [Parks]
      parameters:
        - name: parkId
          in: path
          required: true
          schema:
            type: string
        - name: date
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: visitors
          in: query
          schema:
            type: integer
            default: 1
      responses:
        200:
          description: Availability information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Availability'

  # Tickets Endpoints
  /tickets:
    post:
      summary: Purchase tickets
      tags: [Tickets]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTicketRequest'
      responses:
        201:
          description: Ticket created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Ticket'

    get:
      summary: Get user's tickets
      tags: [Tickets]
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, used, expired, all]
            default: all
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        200:
          description: User's tickets
          content:
            application/json:
              schema:
                type: object
                properties:
                  tickets:
                    type: array
                    items:
                      $ref: '#/components/schemas/Ticket'
                  total:
                    type: integer
                  has_more:
                    type: boolean

  /tickets/{ticketId}:
    get:
      summary: Get ticket details
      tags: [Tickets]
      security:
        - bearerAuth: []
      parameters:
        - name: ticketId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Ticket details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TicketDetails'

  /tickets/{ticketId}/qr:
    get:
      summary: Get QR code for ticket
      tags: [Tickets]
      security:
        - bearerAuth: []
      parameters:
        - name: ticketId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: QR code data
          content:
            application/json:
              schema:
                type: object
                properties:
                  qr_code:
                    type: string
                  backup_code:
                    type: string
                  expires_at:
                    type: string
                    format: date-time

  /tickets/validate:
    post:
      summary: Validate QR code (for staff)
      tags: [Tickets]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [qr_code]
              properties:
                qr_code:
                  type: string
                park_id:
                  type: string
      responses:
        200:
          description: Validation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationResult'

  # User Profile Endpoints
  /users/me:
    get:
      summary: Get current user profile
      tags: [Users]
      security:
        - bearerAuth: []
      responses:
        200:
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

    put:
      summary: Update user profile
      tags: [Users]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
                language:
                  type: string
                  enum: [ru, ky]
      responses:
        200:
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /users/me/children:
    get:
      summary: Get user's children
      tags: [Users]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Children list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Child'

    post:
      summary: Add child profile
      tags: [Users]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, birth_date]
              properties:
                name:
                  type: string
                birth_date:
                  type: string
                  format: date
                gender:
                  type: string
                  enum: [male, female]
      responses:
        201:
          description: Child added
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Child'

  # Loyalty Endpoints
  /loyalty/balance:
    get:
      summary: Get loyalty points balance
      tags: [Loyalty]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Points balance
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoyaltyBalance'

  /loyalty/history:
    get:
      summary: Get loyalty points history
      tags: [Loyalty]
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        200:
          description: Points history
          content:
            application/json:
              schema:
                type: object
                properties:
                  transactions:
                    type: array
                    items:
                      $ref: '#/components/schemas/LoyaltyTransaction'
                  total:
                    type: integer

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        access_token:
          type: string
        refresh_token:
          type: string
        expires_in:
          type: integer

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        phone:
          type: string
        email:
          type: string
        name:
          type: string
        loyalty_points:
          type: integer
        loyalty_tier:
          type: string
          enum: [beginner, friend, vip]
        language:
          type: string
          enum: [ru, ky]
        created_at:
          type: string
          format: date-time

    Child:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        birth_date:
          type: string
          format: date
        age:
          type: integer
        gender:
          type: string
          enum: [male, female]
        photo_url:
          type: string

    Park:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        address:
          type: string
        capacity:
          type: integer
        current_occupancy:
          type: integer
        pricing:
          type: object
          properties:
            under_3:
              type: number
              format: decimal
            over_3:
              type: number
              format: decimal
        hours:
          type: object
          properties:
            open:
              type: string
              format: time
            close:
              type: string
              format: time
        images:
          type: array
          items:
            type: string
        amenities:
          type: array
          items:
            type: string

    Ticket:
      type: object
      properties:
        id:
          type: string
          format: uuid
        park_id:
          type: string
        park_name:
          type: string
        visit_date:
          type: string
          format: date
        status:
          type: string
          enum: [pending_payment, active, used, expired, refunded]
        price:
          type: number
          format: decimal
        children:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
              age:
                type: integer
        qr_code:
          type: string
        created_at:
          type: string
          format: date-time

    CreateTicketRequest:
      type: object
      required: [park_id, visit_date, children, payment_method]
      properties:
        park_id:
          type: string
        visit_date:
          type: string
          format: date
        children:
          type: array
          items:
            type: object
            required: [name, age]
            properties:
              child_id:
                type: string
                format: uuid
              name:
                type: string
              age:
                type: integer
        payment_method:
          type: string
          enum: [visa, mastercard, elcard, mbank, omoney, elqr, loyalty_points]
        loyalty_points_to_use:
          type: integer
          default: 0

    Availability:
      type: object
      properties:
        available:
          type: boolean
        status:
          type: string
          enum: [available, limited, full]
        capacity:
          type: integer
        current_occupancy:
          type: integer
        available_spots:
          type: integer
        occupancy_percentage:
          type: number

    ValidationResult:
      type: object
      properties:
        valid:
          type: boolean
        ticket:
          $ref: '#/components/schemas/Ticket'
        message:
          type: string
        warnings:
          type: array
          items:
            type: string

    LoyaltyBalance:
      type: object
      properties:
        current_points:
          type: integer
        tier:
          type: string
        tier_benefits:
          type: object
        points_to_next_tier:
          type: integer
        expiring_points:
          type: integer
        expiry_date:
          type: string
          format: date

    LoyaltyTransaction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        points:
          type: integer
        type:
          type: string
          enum: [earned, redeemed, expired, bonus]
        description:
          type: string
        reference_type:
          type: string
        created_at:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            request_id:
              type: string
```

## 2. Error Handling

### 2.1 Standard Error Codes
```
AUTH001 - Invalid credentials
AUTH002 - Token expired
AUTH003 - Account locked
TICKET001 - Park at capacity
TICKET002 - Invalid date
TICKET003 - Ticket not found
PAYMENT001 - Payment failed
PAYMENT002 - Insufficient funds
VALIDATION001 - Invalid input
SYSTEM001 - Internal server error
```

### 2.2 Response Format
```json
{
  "error": {
    "code": "TICKET001",
    "message": "Выбранный парк заполнен на указанную дату",
    "details": {
      "park_id": "ala-archa",
      "date": "2024-03-15",
      "available_spots": 0
    },
    "timestamp": "2024-03-15T10:30:00Z",
    "request_id": "req_1234567890"
  }
}
```

## 3. Rate Limiting

### 3.1 Limits by Endpoint Type
- **Authentication**: 10 requests/minute per IP
- **Ticket Creation**: 5 requests/minute per user
- **General API**: 100 requests/minute per user
- **Public Endpoints**: 1000 requests/hour per IP

### 3.2 Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: API Team 
 