# Sky Park Digital Transformation - Product Requirements Document

## 1. Executive Summary

### 1.1 Project Overview
**Project Name:** Sky Park Digital Transformation  
**Project Type:** Mobile-First Progressive Web Application  
**Target Market:** Parents and guardians in Bishkek, Kyrgyzstan  
**Business Objective:** Eliminate queues and digitize ticket purchasing for the largest children's entertainment network

### 1.2 Problem Statement
Sky Park operates 6 entertainment centers across Bishkek serving 10,000+ daily visitors. Current pain points:
- **Long queues** at ticket counters during peak hours
- **No online booking** system available
- **Cash-only transactions** in many locations
- **No loyalty program** to retain customers
- **Manual capacity management** leading to overcrowding
- **No digital customer engagement** outside physical visits

### 1.3 Solution Overview
A mobile-first PWA enabling:
- **Online ticket purchasing** with QR code entry
- **Loyalty points system** with tier-based rewards
- **Real-time park capacity** monitoring
- **Multiple payment methods** including local providers
- **Offline-first architecture** for unreliable internet conditions
- **Multi-language support** (Russian/Kyrgyz)

### 1.4 Success Metrics
- **60% reduction** in queue waiting times
- **40% increase** in customer satisfaction scores
- **25% growth** in repeat visits through loyalty program
- **80% mobile adoption** rate within 6 months
- **99.5% uptime** during business hours

## 2. Market Analysis

### 2.1 Target Audience

#### Primary Users: Young Parents (25-35 years)
- **Demographics:** Urban professionals, tech-savvy, disposable income
- **Pain Points:** Time constraints, queue aversion, convenience seeking
- **Tech Comfort:** High smartphone usage, online payment familiarity
- **Languages:** Primarily Russian, some Kyrgyz
- **Payment Preferences:** Mobile wallets, bank cards, QR payments

#### Secondary Users: Grandparents (45-65 years)
- **Demographics:** Traditional shoppers, family-oriented, price-conscious
- **Pain Points:** Technology anxiety, prefer simple interfaces
- **Tech Comfort:** Basic smartphone usage, prefer guided experiences
- **Languages:** Mix of Russian/Kyrgyz, prefer Russian for digital
- **Payment Preferences:** Traditional cards, cash, simple interfaces

### 2.2 Competitive Landscape
- **Local Competition:** Limited digital presence among entertainment venues
- **Regional Examples:** Damas (Kazakhstan) - basic booking system
- **International Benchmarks:** Disney Experience app, Alton Towers app
- **Competitive Advantages:** First-mover in Kyrgyzstan, offline-first design

## 3. Functional Requirements

### 3.1 User Authentication & Profile Management

#### 3.1.1 Registration Flow
- **Phone-based registration** using +996 format validation
- **OTP verification** via SMS (integrate with local SMS gateway)
- **Profile creation** with name, email (optional), language preference
- **Child profile setup** with names, birth dates, photos (optional)
- **Terms acceptance** and privacy policy consent

#### 3.1.2 Login & Session Management
- **Phone + password login** with "Remember me" option
- **Biometric authentication** (fingerprint/face ID) after initial setup
- **Session persistence** across app restarts
- **Automatic logout** after 30 days of inactivity
- **Multiple device support** with session management

### 3.2 Park Information & Selection

#### 3.2.1 Park Directory
- **All 6 locations display** with photos, addresses, operating hours
- **Real-time capacity indicators**:
  - Green: <70% capacity
  - Yellow: 70-90% capacity  
  - Red: >90% capacity
- **Amenities listing** (age groups, special equipment, dining)
- **Pricing information** by age group
- **Distance calculation** from user location (if permission granted)

### 3.3 Ticket Purchasing Flow

#### 3.3.1 Date & Time Selection
- **Calendar widget** showing available dates (next 30 days)
- **Time slot selection** (morning/afternoon sessions where applicable)
- **Holiday/special event indicators** with premium pricing
- **Unavailable dates** clearly marked with reasons
- **Quick selection shortcuts** (today, tomorrow, this weekend)

#### 3.3.2 Ticket Configuration
- **Child count selection** with age verification
- **Age category validation**:
  - Under 3 years: 590 KGS
  - 3+ years: 790 KGS
- **Child profile assignment** from saved profiles or create new
- **Group discounts** for 4+ children (post-MVP)
- **Add-on services** (food packages, birthday packages)

### 3.4 Payment Processing

#### 3.4.1 Payment Method Selection
- **ELQR QR Code** - National payment system
- **Элкарт (ElCard)** - Local banking cards
- **M-Bank Mobile Wallet** - Popular mobile payment
- **O!Деньги Wallet** - Alternative mobile payment
- **Visa/Mastercard** - International cards
- **Loyalty Points** - Partial or full payment with points

#### 3.4.2 Payment Flow
- **Secure payment processing** with PCI compliance
- **3D Secure authentication** for international cards
- **QR code generation** for ELQR payments
- **Wallet integration** for mobile payment apps
- **Payment confirmation** with transaction ID
- **Receipt generation** (digital + SMS option)

### 3.5 Ticket Management

#### 3.5.1 Active Tickets Display
- **Visual ticket cards** with park images and visit details
- **QR code access** - tap to display full-screen scannable code
- **Visit countdown** showing time until visit date
- **Ticket details** (park, date, children, price paid)
- **Sharing functionality** for group visits
- **Modification options** (reschedule, cancel - if policy allows)

#### 3.5.2 QR Code Display
- **Full-screen QR presentation** optimized for scanning
- **Brightness auto-adjustment** for better scanning
- **Offline QR generation** using cached ticket data
- **Multiple format support** (standard QR, custom Sky Park format)
- **Backup code display** (alphanumeric) if QR fails
- **Scanning instructions** for staff and self-service kiosks

### 3.6 Loyalty Program

#### 3.6.1 Points System
- **Points earning rules**:
  - 1 point per 10 KGS spent
  - Bonus points for first visits to new parks
  - Birthday month bonus (double points)
  - Referral bonuses for bringing new families
- **Points redemption**:
  - 100 points = 50 KGS discount
  - 500 points = free child ticket (under 3)
  - 1000 points = free child ticket (3+)

#### 3.6.2 Tier System
- **Новичок (Beginner)**: 0-999 points
  - Basic points earning
  - Standard pricing
  - Email notifications
- **Друг (Friend)**: 1000-4999 points  
  - 1.5x points multiplier
  - 5% discount on all purchases
  - Priority booking for special events
  - SMS notifications
- **VIP**: 5000+ points
  - 2x points multiplier
  - 10% discount on all purchases
  - Free birthday party package annually
  - Exclusive VIP events access
  - Personal customer support

## 4. Technical Requirements

### 4.1 Frontend Technology Stack
- **Framework**: Next.js 14.1.0 with App Router
- **Language**: TypeScript 5.3.3 for type safety
- **UI Framework**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: Zustand 4.5.0 for client state
- **Testing**: Vitest 1.2.0 for unit tests, Playwright 1.41 for E2E
- **Build Tool**: Vite 5.0 for fast development and optimized builds

### 4.2 Backend Technology Stack
- **Language**: Go 1.22 for high performance and concurrency
- **Framework**: Gin 1.9.1 for HTTP routing and middleware
- **Database**: PostgreSQL 15.5 with JSONB support
- **Cache**: Redis 7.2 for session storage and caching
- **Queue**: RabbitMQ 3.12 for background job processing
- **Storage**: MinIO for S3-compatible object storage

### 4.3 Infrastructure Requirements
- **Orchestration**: K3s 1.28 (lightweight Kubernetes)
- **Deployment**: Edge nodes at each park location
- **Monitoring**: Prometheus 2.48 + Grafana for metrics
- **Logging**: Loki 2.9 for centralized log aggregation
- **CI/CD**: GitLab CE 16.7 for self-hosted automation

### 4.4 Performance Requirements
- **Page Load Time**: <2 seconds on 3G connection
- **API Response Time**: <100ms p95 for core endpoints
- **QR Code Generation**: <500ms for ticket creation
- **Search Results**: <1 second for park/date searches
- **Payment Processing**: <10 seconds end-to-end
- **Uptime Target**: 99.5% during business hours

### 4.5 Security Requirements
- **Authentication**: JWT tokens with 15-minute expiry, refresh tokens with 30-day expiry
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **Payment Security**: PCI compliance for credit card processing
- **Data Protection**: GDPR-style data handling and deletion capabilities
- **Rate Limiting**: API endpoints limited to prevent abuse

## 5. Integration Requirements

### 5.1 Payment Gateway Integrations

#### 5.1.1 ELQR (National QR Payment System)
- **Integration Type**: REST API
- **Authentication**: API key + request signing
- **Capabilities**: QR code generation, payment status tracking
- **Compliance**: National payment regulations

#### 5.1.2 Элкарт (ElCard) Banking Integration
- **Integration Type**: OAuth 2.0 + REST API
- **Capabilities**: Card processing, 3D Secure, refunds
- **Compliance**: PCI DSS requirements
- **Settlement**: T+1 business day settlement

#### 5.1.3 Mobile Wallet Integrations
- **M-Bank**: Direct API integration for wallet payments
- **O!Деньги**: SDK integration for seamless UX
- **Future Wallets**: Pluggable architecture for new providers

### 5.2 Communication Services
- **SMS Gateway**: Local Kyrgyz provider for OTP and notifications
- **Push Notifications**: FCM for Android, APNs for iOS, Web Push for PWA
- **Email Service**: Transactional emails for receipts and communications

## 6. User Stories & Acceptance Criteria

### 6.1 Epic 1: User Registration & Profile
**As a** new parent visiting Sky Park  
**I want to** create an account using my phone number  
**So that I can** purchase tickets online and skip queues

**Acceptance Criteria:**
- Phone number validation accepts +996 format
- SMS OTP is delivered within 30 seconds
- Profile creation requires name and accepts optional email
- User can add child profiles during registration
- Account creation completes within 2 minutes

### 6.2 Epic 2: Ticket Purchasing
**As a** parent planning a visit  
**I want to** see all available parks with current capacity  
**So that I can** choose the best location for my family

**Acceptance Criteria:**
- All 6 parks display with photos and basic info
- Real-time capacity shows as color-coded indicators
- Can complete ticket purchase in under 3 minutes
- Payment methods include all local providers
- QR codes are generated immediately after payment

### 6.3 Epic 3: Loyalty Program
**As a** regular customer  
**I want to** track my loyalty points and tier status  
**So that I can** understand my benefits and progress

**Acceptance Criteria:**
- Points balance is visible on home screen
- Tier status and benefits are clearly displayed
- Points can be used for discounts during checkout
- Automatic tier upgrades with celebrations

## 7. Success Metrics & KPIs

### 7.1 Business Metrics
- **Revenue Impact**: 25% increase in ticket sales within 6 months
- **Operational Efficiency**: 60% reduction in queue wait times
- **Customer Satisfaction**: Net Promoter Score (NPS) of 70+
- **Adoption Rate**: 40% of sales through app by month 12

### 7.2 Technical Metrics
- **Performance**: <2 second page loads, <100ms API response
- **Availability**: 99.5% uptime during business hours
- **Adoption**: 10,000+ downloads in first month
- **User Engagement**: 60%+ monthly active users

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks
- **Internet Connectivity**: Mitigated by offline-first architecture
- **Payment Gateway Failures**: Multiple provider integrations
- **Scalability**: Auto-scaling infrastructure with K3s

### 8.2 Business Risks
- **Low User Adoption**: Phased rollout with incentives
- **Competition**: Strong brand association and network effects

## 9. Launch Strategy

### 9.1 Phased Rollout
- **Phase 1**: Soft launch at 1 park (weeks 1-4)
- **Phase 2**: Beta testing at 2 parks (weeks 5-8)
- **Phase 3**: Public launch all parks (weeks 9-12)
- **Phase 4**: Feature enhancement (weeks 13-24)

### 9.2 Marketing & Support
- **Pre-launch**: Staff training and teaser campaigns
- **Launch**: Grand opening with app-exclusive promotions
- **Post-launch**: Monthly promotions and referral bonuses
- **Support**: In-app help, WhatsApp support, phone support

## 10. Post-Launch Evolution

### 10.1 Immediate Enhancements (Months 1-3)
- Push notifications for personalized offers
- Social sharing features for visit memories
- Advanced filters for park selection
- Feedback system for continuous improvement

### 10.2 Long-term Vision (Year 2+)
- Expansion to other cities in Kyrgyzstan
- Franchise system for other entertainment venues
- AI-powered recommendations for optimal visit times
- Augmented reality features for enhanced experiences

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Product Team

 