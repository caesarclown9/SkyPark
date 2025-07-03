# Sky Park Database Schema

## 1. Database Design Philosophy

### 1.1 Design Principles
- **Event Sourcing**: All state changes captured as immutable events
- **CQRS**: Separate read and write models for optimal performance
- **Offline-First**: Support for eventual consistency and conflict resolution
- **Audit Trail**: Complete history of all operations for compliance

### 1.2 PostgreSQL Features Used
- **JSONB**: For flexible document storage (children data, park amenities)
- **UUID**: For globally unique identifiers across distributed system
- **Temporal Tables**: For tracking data changes over time
- **Partial Indexes**: For optimizing specific query patterns
- **Full-Text Search**: For park and user search functionality

## 2. Core Tables

### 2.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    loyalty_tier VARCHAR(20) DEFAULT 'beginner' 
        CHECK (loyalty_tier IN ('beginner', 'friend', 'vip')),
    language VARCHAR(2) DEFAULT 'ru' 
        CHECK (language IN ('ru', 'ky')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_phone ON users(phone) WHERE is_active = true;
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL AND is_active = true;
CREATE INDEX idx_users_loyalty_tier ON users(loyalty_tier) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 2.2 Children Table
```sql
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL CHECK (birth_date <= CURRENT_DATE),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Computed column for age
ALTER TABLE children ADD COLUMN age_years INTEGER 
    GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER
    ) STORED;

-- Indexes for children table
CREATE INDEX idx_children_user_id ON children(user_id) WHERE is_active = true;
CREATE INDEX idx_children_age ON children(age_years) WHERE is_active = true;
CREATE INDEX idx_children_birth_date ON children(birth_date);

CREATE TRIGGER children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 2.3 Parks Table
```sql
CREATE TABLE parks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ky VARCHAR(255), -- Kyrgyz translation
    address TEXT NOT NULL,
    address_ky TEXT, -- Kyrgyz translation
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
    price_under_3 DECIMAL(10,2) NOT NULL CHECK (price_under_3 >= 0),
    price_over_3 DECIMAL(10,2) NOT NULL CHECK (price_over_3 >= 0),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    
    -- Location data
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    
    -- JSON data
    amenities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    operating_hours JSONB DEFAULT '{}'::jsonb, -- Different hours for different days
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_temporarily_closed BOOLEAN DEFAULT false,
    closure_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (current_occupancy <= capacity),
    CHECK (open_time < close_time OR close_time < open_time), -- Allow overnight operation
    CHECK (lat BETWEEN -90 AND 90),
    CHECK (lng BETWEEN -180 AND 180)
);

-- Indexes for parks table
CREATE INDEX idx_parks_active ON parks(id) WHERE is_active = true;
CREATE INDEX idx_parks_capacity ON parks(capacity, current_occupancy) WHERE is_active = true;
CREATE INDEX idx_parks_location ON parks USING gist (point(lng, lat)) WHERE is_active = true;

-- Full-text search index
CREATE INDEX idx_parks_search ON parks USING gin(
    to_tsvector('russian', coalesce(name, '') || ' ' || coalesce(address, ''))
) WHERE is_active = true;

CREATE TRIGGER parks_updated_at
    BEFORE UPDATE ON parks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to update occupancy
CREATE OR REPLACE FUNCTION update_park_occupancy(park_id VARCHAR(50), delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_occupancy INTEGER;
BEGIN
    UPDATE parks 
    SET current_occupancy = GREATEST(0, current_occupancy + delta),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = park_id
    RETURNING current_occupancy INTO new_occupancy;
    
    RETURN new_occupancy;
END;
$$ LANGUAGE plpgsql;
```

### 2.4 Tickets Table
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    park_id VARCHAR(50) NOT NULL REFERENCES parks(id),
    
    -- Ticket details
    ticket_type VARCHAR(20) NOT NULL DEFAULT 'single' 
        CHECK (ticket_type IN ('single', 'subscription')),
    visit_date DATE NOT NULL,
    visit_time_slot VARCHAR(20), -- 'morning', 'afternoon', 'evening'
    
    -- QR and validation
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    qr_secret VARCHAR(255) NOT NULL, -- For validation
    backup_code VARCHAR(8) NOT NULL, -- Manual entry fallback
    
    -- Status and lifecycle
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('pending_payment', 'active', 'used', 'expired', 'refunded', 'cancelled')),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    loyalty_points_used INTEGER DEFAULT 0 CHECK (loyalty_points_used >= 0),
    
    -- Children data (JSONB for flexibility)
    children_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [{"name": "John", "age": 5, "child_id": "uuid", "price": 790}]
    
    -- Usage tracking
    entry_time TIMESTAMP WITH TIME ZONE,
    exit_time TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    validated_by VARCHAR(255), -- Staff member or system ID
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (visit_date >= CURRENT_DATE - INTERVAL '1 day'), -- Allow same-day tickets
    CHECK (discount_amount <= price),
    CHECK (entry_time IS NULL OR exit_time IS NULL OR exit_time >= entry_time)
);

-- Indexes for tickets table
CREATE INDEX idx_tickets_user_date ON tickets(user_id, visit_date) WHERE status IN ('active', 'used');
CREATE INDEX idx_tickets_park_date ON tickets(park_id, visit_date) WHERE status IN ('active', 'used');
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code) WHERE status = 'active';
CREATE INDEX idx_tickets_status_date ON tickets(status, visit_date);
CREATE INDEX idx_tickets_visit_date ON tickets(visit_date) WHERE status IN ('active', 'pending_payment');
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- Partial index for active tickets only
CREATE INDEX idx_tickets_active_user ON tickets(user_id, visit_date) 
    WHERE status = 'active' AND visit_date >= CURRENT_DATE;

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to generate QR codes
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SP' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD') || 
           encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_code()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
END;
$$ LANGUAGE plpgsql;
```

### 2.5 Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    ticket_id UUID REFERENCES tickets(id),
    
    -- Transaction details
    type VARCHAR(30) NOT NULL 
        CHECK (type IN ('ticket_purchase', 'loyalty_redemption', 'refund', 'loyalty_award')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KGS' NOT NULL,
    
    -- Payment method and processing
    payment_method VARCHAR(30) NOT NULL 
        CHECK (payment_method IN ('visa', 'mastercard', 'elcard', 'mbank', 'omoney', 'elqr', 'cash', 'loyalty_points')),
    payment_provider VARCHAR(50),
    external_transaction_id VARCHAR(255),
    
    -- Status and lifecycle
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Metadata and audit
    metadata JSONB DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (amount != 0), -- Prevent zero-amount transactions
    CHECK (processed_at IS NULL OR processed_at >= created_at)
);

-- Indexes for transactions table
CREATE INDEX idx_transactions_user_id ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_ticket_id ON transactions(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status, created_at) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method, created_at DESC);
CREATE INDEX idx_transactions_external_id ON transactions(external_transaction_id) 
    WHERE external_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE TRIGGER transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

## 3. Event Sourcing Tables

### 3.1 Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_version INTEGER NOT NULL,
    
    -- Event data
    event_data JSONB NOT NULL,
    event_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Correlation and causation
    correlation_id UUID,
    causation_id UUID,
    
    -- Geographic partitioning
    park_id VARCHAR(50),
    
    -- Synchronization for offline support
    synced BOOLEAN DEFAULT false,
    sync_attempts INTEGER DEFAULT 0,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255), -- User or system that created the event
    
    -- Constraints
    UNIQUE(aggregate_id, event_version),
    CHECK (event_version > 0),
    CHECK (sync_attempts >= 0)
);

-- Indexes for events table
CREATE INDEX idx_events_aggregate ON events(aggregate_id, event_version);
CREATE INDEX idx_events_type_created ON events(event_type, created_at);
CREATE INDEX idx_events_park_sync ON events(park_id, synced, created_at) WHERE park_id IS NOT NULL;
CREATE INDEX idx_events_unsynced ON events(created_at) WHERE synced = false;
CREATE INDEX idx_events_correlation ON events(correlation_id) WHERE correlation_id IS NOT NULL;

-- Partition by date for performance
CREATE TABLE events_y2024m12 PARTITION OF events
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

### 3.2 CRDT State Table
```sql
CREATE TABLE crdt_state (
    id VARCHAR(255) PRIMARY KEY,
    node_id VARCHAR(50) NOT NULL,
    vector_clock JSONB NOT NULL DEFAULT '{}'::jsonb,
    data JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    
    -- Conflict resolution
    last_writer_wins BOOLEAN DEFAULT false,
    merge_strategy VARCHAR(20) DEFAULT 'lww' 
        CHECK (merge_strategy IN ('lww', 'union', 'intersection', 'custom')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (jsonb_typeof(vector_clock) = 'object')
);

-- Indexes for CRDT state
CREATE INDEX idx_crdt_node_type ON crdt_state(node_id, data_type);
CREATE INDEX idx_crdt_updated ON crdt_state(updated_at);

CREATE TRIGGER crdt_state_updated_at
    BEFORE UPDATE ON crdt_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

## 4. Loyalty and Rewards Tables

### 4.1 Loyalty Transactions
```sql
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Transaction details
    points INTEGER NOT NULL CHECK (points != 0),
    transaction_type VARCHAR(20) NOT NULL 
        CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted', 'bonus')),
    
    -- Source and reference
    source VARCHAR(30) NOT NULL 
        CHECK (source IN ('ticket_purchase', 'referral', 'birthday_bonus', 'admin_adjustment', 'redemption')),
    reference_id UUID, -- ticket_id, transaction_id, etc.
    reference_type VARCHAR(20),
    
    -- Details
    description TEXT NOT NULL,
    multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (multiplier > 0),
    
    -- Expiration for earned points
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' 
        CHECK (status IN ('completed', 'pending', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Constraints
    CHECK (
        (transaction_type = 'earned' AND points > 0) OR 
        (transaction_type IN ('redeemed', 'expired') AND points < 0) OR
        (transaction_type = 'adjusted') OR
        (transaction_type = 'bonus' AND points > 0)
    )
);

-- Indexes for loyalty transactions
CREATE INDEX idx_loyalty_user_date ON loyalty_transactions(user_id, created_at DESC);
CREATE INDEX idx_loyalty_reference ON loyalty_transactions(reference_id, reference_type) 
    WHERE reference_id IS NOT NULL;
CREATE INDEX idx_loyalty_expiring ON loyalty_transactions(expires_at) 
    WHERE expires_at IS NOT NULL AND status = 'completed';
CREATE INDEX idx_loyalty_type ON loyalty_transactions(transaction_type, created_at);
```

### 4.2 Loyalty Tiers
```sql
CREATE TABLE loyalty_tiers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_ky VARCHAR(50), -- Kyrgyz translation
    description TEXT,
    description_ky TEXT,
    
    -- Requirements
    min_points INTEGER NOT NULL CHECK (min_points >= 0),
    max_points INTEGER CHECK (max_points IS NULL OR max_points > min_points),
    
    -- Benefits
    point_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (point_multiplier > 0),
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    
    -- Benefits configuration
    benefits JSONB DEFAULT '[]'::jsonb,
    -- Structure: [{"type": "discount", "value": 10}, {"type": "free_birthday", "enabled": true}]
    
    -- Display
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for loyalty tiers
CREATE INDEX idx_loyalty_tiers_points ON loyalty_tiers(min_points, max_points) WHERE is_active = true;
CREATE INDEX idx_loyalty_tiers_order ON loyalty_tiers(order_index) WHERE is_active = true;

CREATE TRIGGER loyalty_tiers_updated_at
    BEFORE UPDATE ON loyalty_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default tiers
INSERT INTO loyalty_tiers (id, name, name_ky, min_points, max_points, point_multiplier, discount_percentage, color) VALUES
('beginner', 'Новичок', 'Жаңы адам', 0, 999, 1.0, 0, '#87CEEB'),
('friend', 'Друг', 'Дос', 1000, 4999, 1.5, 5, '#FFD700'),
('vip', 'VIP', 'VIP', 5000, NULL, 2.0, 10, '#9370DB');
```

## 5. Operational Tables

### 5.1 Park Visits (Real-time occupancy tracking)
```sql
CREATE TABLE park_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    park_id VARCHAR(50) NOT NULL REFERENCES parks(id),
    ticket_id UUID REFERENCES tickets(id),
    
    -- Visit details
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP WITH TIME ZONE,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Visitor information
    visitor_count INTEGER NOT NULL DEFAULT 1 CHECK (visitor_count > 0),
    visitor_ages JSONB, -- Array of ages for analytics
    
    -- Entry method
    entry_method VARCHAR(20) DEFAULT 'qr' 
        CHECK (entry_method IN ('qr', 'manual', 'staff')),
    entry_point VARCHAR(50), -- Gate/entrance identifier
    validated_by VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'exited', 'expired')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (exit_time IS NULL OR exit_time >= entry_time)
);

-- Indexes for park visits
CREATE INDEX idx_park_visits_park_date ON park_visits(park_id, visit_date);
CREATE INDEX idx_park_visits_active ON park_visits(park_id, status) 
    WHERE status = 'active';
CREATE INDEX idx_park_visits_ticket ON park_visits(ticket_id) 
    WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_park_visits_entry_time ON park_visits(entry_time);

-- Partition by month for performance
CREATE TABLE park_visits_y2024m12 PARTITION OF park_visits
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TRIGGER park_visits_updated_at
    BEFORE UPDATE ON park_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 5.2 System Configuration
```sql
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    
    -- Validation
    data_type VARCHAR(20) NOT NULL 
        CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array')),
    validation_rules JSONB,
    
    -- Metadata
    is_public BOOLEAN DEFAULT false, -- Can be exposed to frontend
    is_sensitive BOOLEAN DEFAULT false, -- Requires special handling
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Indexes for system config
CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_public ON system_config(is_public) WHERE is_public = true;

CREATE TRIGGER system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default configuration
INSERT INTO system_config (key, value, description, category, data_type, is_public) VALUES
('pricing.under_3', '590', 'Price for children under 3 years old (KGS)', 'pricing', 'number', true),
('pricing.over_3', '790', 'Price for children 3+ years old (KGS)', 'pricing', 'number', true),
('loyalty.points_per_som', '0.1', 'Loyalty points earned per som spent', 'loyalty', 'number', false),
('loyalty.expiry_months', '12', 'Months until loyalty points expire', 'loyalty', 'number', false),
('capacity.warning_threshold', '0.8', 'Threshold for capacity warnings (80%)', 'capacity', 'number', false),
('qr.expiry_hours', '24', 'Hours until QR code expires after creation', 'qr', 'number', false);
```

## 6. Analytics and Reporting

### 6.1 Daily Statistics (Materialized View)
```sql
CREATE MATERIALIZED VIEW daily_park_stats AS
SELECT 
    park_id,
    visit_date,
    COUNT(DISTINCT ticket_id) as total_tickets,
    SUM(visitor_count) as total_visitors,
    AVG(visitor_count) as avg_group_size,
    COUNT(DISTINCT CASE WHEN entry_method = 'qr' THEN ticket_id END) as qr_entries,
    COUNT(DISTINCT CASE WHEN entry_method = 'manual' THEN ticket_id END) as manual_entries,
    MIN(entry_time) as first_entry,
    MAX(COALESCE(exit_time, entry_time)) as last_activity,
    SUM(CASE WHEN visitor_ages IS NOT NULL THEN 
        jsonb_array_length(visitor_ages) 
        ELSE visitor_count 
    END) as total_children,
    
    -- Revenue data (joined from transactions)
    SUM(t.amount) FILTER (WHERE t.status = 'completed') as total_revenue,
    COUNT(DISTINCT t.user_id) FILTER (WHERE t.status = 'completed') as paying_customers
FROM park_visits pv
LEFT JOIN tickets tk ON pv.ticket_id = tk.id
LEFT JOIN transactions t ON tk.id = t.ticket_id
GROUP BY park_id, visit_date;

-- Index for materialized view
CREATE UNIQUE INDEX idx_daily_park_stats_pk ON daily_park_stats(park_id, visit_date);

-- Refresh daily at midnight
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_park_stats;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 User Analytics
```sql
CREATE MATERIALIZED VIEW user_analytics AS
SELECT 
    u.id as user_id,
    u.created_at as registration_date,
    u.loyalty_tier,
    u.loyalty_points,
    
    -- Visit statistics
    COUNT(DISTINCT t.id) as total_tickets,
    COUNT(DISTINCT pv.id) as total_visits,
    MIN(t.visit_date) as first_visit_date,
    MAX(t.visit_date) as last_visit_date,
    
    -- Spending statistics
    SUM(tr.amount) FILTER (WHERE tr.status = 'completed' AND tr.type = 'ticket_purchase') as total_spent,
    AVG(tr.amount) FILTER (WHERE tr.status = 'completed' AND tr.type = 'ticket_purchase') as avg_transaction,
    
    -- Loyalty statistics
    SUM(lt.points) FILTER (WHERE lt.transaction_type = 'earned') as points_earned,
    SUM(-lt.points) FILTER (WHERE lt.transaction_type = 'redeemed') as points_redeemed,
    
    -- Behavior patterns
    COUNT(DISTINCT t.park_id) as parks_visited,
    AVG(jsonb_array_length(t.children_data)) as avg_children_per_visit,
    
    -- Recency, Frequency, Monetary (RFM) analysis
    CURRENT_DATE - MAX(t.visit_date) as days_since_last_visit,
    COUNT(DISTINCT t.id) * 1.0 / GREATEST(1, EXTRACT(DAYS FROM AGE(CURRENT_DATE, MIN(t.visit_date)))) * 365 as visit_frequency_per_year
    
FROM users u
LEFT JOIN tickets t ON u.id = t.user_id
LEFT JOIN transactions tr ON t.id = tr.ticket_id
LEFT JOIN loyalty_transactions lt ON u.id = lt.user_id
LEFT JOIN park_visits pv ON t.id = pv.ticket_id
WHERE u.is_active = true
GROUP BY u.id, u.created_at, u.loyalty_tier, u.loyalty_points;

CREATE UNIQUE INDEX idx_user_analytics_pk ON user_analytics(user_id);
```

## 7. Database Functions and Procedures

### 7.1 Loyalty Points Management
```sql
-- Function to calculate and award loyalty points
CREATE OR REPLACE FUNCTION award_loyalty_points(
    p_user_id UUID,
    p_transaction_id UUID,
    p_amount DECIMAL
) RETURNS INTEGER AS $$
DECLARE
    v_points INTEGER;
    v_tier_multiplier DECIMAL;
    v_user_tier VARCHAR(20);
BEGIN
    -- Get user's current tier
    SELECT loyalty_tier INTO v_user_tier 
    FROM users 
    WHERE id = p_user_id;
    
    -- Get tier multiplier
    SELECT point_multiplier INTO v_tier_multiplier
    FROM loyalty_tiers
    WHERE id = v_user_tier;
    
    -- Calculate points (1 point per 10 KGS, with tier multiplier)
    v_points := FLOOR(p_amount / 10 * v_tier_multiplier);
    
    -- Award points
    INSERT INTO loyalty_transactions (
        user_id, points, transaction_type, source, 
        reference_id, reference_type, description
    ) VALUES (
        p_user_id, v_points, 'earned', 'ticket_purchase',
        p_transaction_id, 'transaction', 
        'Points earned from ticket purchase'
    );
    
    -- Update user's total points
    UPDATE users 
    SET loyalty_points = loyalty_points + v_points,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    -- Check for tier upgrade
    PERFORM check_tier_upgrade(p_user_id);
    
    RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- Function to check and upgrade user tier
CREATE OR REPLACE FUNCTION check_tier_upgrade(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_current_points INTEGER;
    v_new_tier VARCHAR(20);
    v_current_tier VARCHAR(20);
BEGIN
    -- Get user's current points and tier
    SELECT loyalty_points, loyalty_tier 
    INTO v_current_points, v_current_tier
    FROM users 
    WHERE id = p_user_id;
    
    -- Find appropriate tier
    SELECT id INTO v_new_tier
    FROM loyalty_tiers
    WHERE v_current_points >= min_points 
      AND (max_points IS NULL OR v_current_points <= max_points)
      AND is_active = true
    ORDER BY min_points DESC
    LIMIT 1;
    
    -- Update tier if changed
    IF v_new_tier != v_current_tier THEN
        UPDATE users 
        SET loyalty_tier = v_new_tier,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_user_id;
        
        -- Log tier change
        INSERT INTO loyalty_transactions (
            user_id, points, transaction_type, source, description
        ) VALUES (
            p_user_id, 0, 'adjusted', 'tier_upgrade',
            'Tier upgraded from ' || v_current_tier || ' to ' || v_new_tier
        );
    END IF;
    
    RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Capacity Management
```sql
-- Function to check park availability
CREATE OR REPLACE FUNCTION check_park_availability(
    p_park_id VARCHAR(50),
    p_visit_date DATE,
    p_visitor_count INTEGER DEFAULT 1
) RETURNS JSON AS $$
DECLARE
    v_capacity INTEGER;
    v_current_occupancy INTEGER;
    v_booked_today INTEGER;
    v_available INTEGER;
    v_status VARCHAR(20);
BEGIN
    -- Get park capacity
    SELECT capacity, current_occupancy 
    INTO v_capacity, v_current_occupancy
    FROM parks 
    WHERE id = p_park_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'available', false,
            'error', 'Park not found or inactive'
        );
    END IF;
    
    -- Count tickets for the specific date
    SELECT COUNT(*) INTO v_booked_today
    FROM tickets 
    WHERE park_id = p_park_id 
      AND visit_date = p_visit_date 
      AND status IN ('active', 'pending_payment');
    
    -- Calculate availability
    v_available := v_capacity - v_current_occupancy - v_booked_today;
    
    -- Determine status
    IF v_available >= p_visitor_count THEN
        IF v_available > v_capacity * 0.3 THEN
            v_status := 'available';
        ELSE
            v_status := 'limited';
        END IF;
    ELSE
        v_status := 'full';
    END IF;
    
    RETURN json_build_object(
        'available', v_available >= p_visitor_count,
        'status', v_status,
        'capacity', v_capacity,
        'current_occupancy', v_current_occupancy,
        'booked_for_date', v_booked_today,
        'available_spots', v_available,
        'occupancy_percentage', ROUND((v_current_occupancy + v_booked_today) * 100.0 / v_capacity, 1)
    );
END;
$$ LANGUAGE plpgsql;
```

## 8. Performance Optimization

### 8.1 Partitioning Strategy
```sql
-- Partition events table by month
CREATE TABLE events_default PARTITION OF events DEFAULT;

-- Create monthly partitions for the next year
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    table_name TEXT;
BEGIN
    FOR i IN 0..11 LOOP
        start_date := date_trunc('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + INTERVAL '1 month';
        table_name := 'events_' || to_char(start_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE %I PARTITION OF events FOR VALUES FROM (%L) TO (%L)',
                      table_name, start_date, end_date);
    END LOOP;
END $$;
```

### 8.2 Database Maintenance
```sql
-- Function to clean up expired tickets
CREATE OR REPLACE FUNCTION cleanup_expired_tickets()
RETURNS INTEGER AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    -- Mark tickets as expired
    UPDATE tickets 
    SET status = 'expired',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active' 
      AND visit_date < CURRENT_DATE - INTERVAL '1 day';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO system_log (level, message, metadata) VALUES (
        'INFO', 
        'Cleanup expired tickets completed',
        json_build_object('tickets_updated', v_updated)
    );
    
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily
-- This would be set up in the application scheduler or cron
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Database Team 
 