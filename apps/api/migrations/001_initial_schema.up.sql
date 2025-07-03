-- Initial schema migration for Sky Park
-- Creating all core tables for Kyrgyzstan children's entertainment centers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enums
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE loyalty_tier AS ENUM ('beginner', 'friend', 'vip');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'not_stated');

CREATE TYPE park_status AS ENUM ('active', 'inactive', 'maintenance', 'closed');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE amenity_type AS ENUM ('play', 'food', 'service', 'accessibility', 'event');

CREATE TYPE ticket_status AS ENUM ('pending', 'active', 'used', 'expired', 'cancelled', 'refunded');
CREATE TYPE ticket_type AS ENUM ('single', 'group', 'family', 'vip', 'unlimited');
CREATE TYPE age_category AS ENUM ('baby', 'child', 'teen', 'adult', 'senior');

CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE booking_source AS ENUM ('web', 'mobile', 'admin', 'partner', 'walk_in');

CREATE TYPE payment_method AS ENUM ('elqr', 'elcart', 'mbank', 'odengi', 'bank_card', 'cash', 'loyalty_points', 'wallet');
CREATE TYPE payment_provider AS ENUM ('elqr', 'elcart', 'mbank', 'odengi', 'visa', 'mastercard', 'internal');
CREATE TYPE refund_reason AS ENUM ('user_request', 'booking_cancelled', 'park_closure', 'technical_issue', 'overbooking', 'admin_action');

-- ====================================
-- USERS TABLE
-- ====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL CHECK (phone_number ~ '^\+996[0-9]{9}$'),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender gender,
    avatar TEXT,
    status user_status NOT NULL DEFAULT 'active',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Loyalty program
    loyalty_tier loyalty_tier NOT NULL DEFAULT 'beginner',
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    total_spent DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
    last_visit_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences  
    preferred_language VARCHAR(2) NOT NULL DEFAULT 'ru' CHECK (preferred_language IN ('ru', 'ky')),
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20) CHECK (emergency_contact_phone IS NULL OR emergency_contact_phone ~ '^\+996[0-9]{9}$'),
    
    -- System fields
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255),
    refresh_token TEXT,
    refresh_token_expiry TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_loyalty_tier ON users(loyalty_tier);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- ====================================
-- PARKS TABLE  
-- ====================================
CREATE TABLE parks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    status park_status NOT NULL DEFAULT 'active',
    
    -- Location (stored as JSONB for flexibility)
    address JSONB NOT NULL,
    coordinates JSONB NOT NULL,
    
    -- Contact information
    phone_number VARCHAR(20) CHECK (phone_number IS NULL OR phone_number ~ '^\+996[0-9]{9}$'),
    email VARCHAR(255) CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    website TEXT,
    
    -- Operating information (stored as JSONB arrays)
    operating_hours JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    capacity JSONB NOT NULL,
    
    -- Media
    main_image TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Pricing (base prices in KGS)
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    child_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (child_price >= 0),
    adult_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (adult_price >= 0),
    senior_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (senior_price >= 0),
    group_discount DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (group_discount >= 0 AND group_discount <= 100),
    
    -- Features
    has_parking BOOLEAN NOT NULL DEFAULT FALSE,
    has_wifi BOOLEAN NOT NULL DEFAULT FALSE,
    has_restaurant BOOLEAN NOT NULL DEFAULT FALSE,
    has_gift_shop BOOLEAN NOT NULL DEFAULT FALSE,
    is_wheelchair_accessible BOOLEAN NOT NULL DEFAULT FALSE,
    allows_outside_food BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Statistics
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
    total_visitors INTEGER NOT NULL DEFAULT 0 CHECK (total_visitors >= 0),
    monthly_visitors INTEGER NOT NULL DEFAULT 0 CHECK (monthly_visitors >= 0),
    
    -- System fields
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for parks
CREATE INDEX idx_parks_name ON parks(name);
CREATE INDEX idx_parks_status ON parks(status);
CREATE INDEX idx_parks_coordinates ON parks USING GIN(coordinates);
CREATE INDEX idx_parks_average_rating ON parks(average_rating);
CREATE INDEX idx_parks_created_at ON parks(created_at);
CREATE INDEX idx_parks_deleted_at ON parks(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_parks_metadata ON parks USING GIN(metadata);

-- Spatial index for location-based queries
CREATE INDEX idx_parks_address ON parks USING GIN(address);

-- ====================================
-- BOOKINGS TABLE
-- ====================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    park_id UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    status booking_status NOT NULL DEFAULT 'draft',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    source booking_source NOT NULL DEFAULT 'web',
    
    -- Booking details
    visit_date DATE NOT NULL,
    time_slot VARCHAR(5) CHECK (time_slot IS NULL OR time_slot ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    duration INTEGER NOT NULL DEFAULT 180 CHECK (duration >= 30), -- minutes
    
    -- Items (stored as JSONB array)
    items JSONB NOT NULL DEFAULT '[]',
    total_guests INTEGER NOT NULL CHECK (total_guests >= 1),
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    
    -- Discounts and loyalty
    discounts JSONB DEFAULT '[]',
    loyalty_points_used INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points_used >= 0),
    loyalty_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points_earned >= 0),
    promo_code VARCHAR(50),
    
    -- Contact information (stored as JSONB)
    contact_info JSONB NOT NULL,
    
    -- Special requirements
    special_requirements TEXT[] DEFAULT '{}',
    notes TEXT,
    staff_notes TEXT,
    
    -- Timestamps and tracking
    booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation info
    cancellation_reason VARCHAR(500),
    cancelled_by UUID REFERENCES users(id),
    refund_amount DECIMAL(12,2) CHECK (refund_amount IS NULL OR refund_amount >= 0),
    refund_reason VARCHAR(500),
    
    -- System fields
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT check_visit_date_future CHECK (visit_date >= CURRENT_DATE),
    CONSTRAINT check_refund_amount_le_total CHECK (refund_amount IS NULL OR refund_amount <= total_amount)
);

-- Indexes for bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_park_id ON bookings(park_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_visit_date ON bookings(visit_date);
CREATE INDEX idx_bookings_booked_at ON bookings(booked_at);
CREATE INDEX idx_bookings_total_amount ON bookings(total_amount);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bookings_metadata ON bookings USING GIN(metadata);
CREATE INDEX idx_bookings_contact_info ON bookings USING GIN(contact_info);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_park_visit_date ON bookings(park_id, visit_date);

-- ====================================
-- TICKETS TABLE
-- ====================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    park_id UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type ticket_type NOT NULL,
    age_category age_category NOT NULL,
    status ticket_status NOT NULL DEFAULT 'pending',
    
    -- Ticket details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) NOT NULL CHECK (original_price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    discount DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    max_usages INTEGER NOT NULL DEFAULT 1 CHECK (max_usages >= 1),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    
    -- QR Code (stored as JSONB)
    qr_code JSONB NOT NULL,
    
    -- Validation history (stored as JSONB array)
    validations JSONB DEFAULT '[]',
    
    -- Additional info
    holder_name VARCHAR(255) NOT NULL,
    holder_age INTEGER CHECK (holder_age IS NULL OR (holder_age >= 0 AND holder_age <= 120)),
    special_requirements TEXT[] DEFAULT '{}',
    notes VARCHAR(500),
    
    -- System fields
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT check_valid_dates CHECK (valid_to > valid_from),
    CONSTRAINT check_usage_count_le_max CHECK (usage_count <= max_usages)
);

-- Indexes for tickets
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_park_id ON tickets(park_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_age_category ON tickets(age_category);
CREATE INDEX idx_tickets_valid_from ON tickets(valid_from);
CREATE INDEX idx_tickets_valid_to ON tickets(valid_to);
CREATE INDEX idx_tickets_holder_name ON tickets(holder_name);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_deleted_at ON tickets(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_tickets_qr_code ON tickets USING GIN(qr_code);
CREATE INDEX idx_tickets_metadata ON tickets USING GIN(metadata);

-- QR code search index
CREATE INDEX idx_tickets_qr_code_code ON tickets((qr_code->>'code'));

-- ====================================
-- PAYMENTS TABLE
-- ====================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Amounts (in KGS)
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    original_amount DECIMAL(12,2) NOT NULL CHECK (original_amount >= 0),
    fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    net_amount DECIMAL(12,2) NOT NULL CHECK (net_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    
    -- Exchange rate info (if applicable)
    exchange_rate DECIMAL(10,6) CHECK (exchange_rate IS NULL OR exchange_rate > 0),
    original_currency VARCHAR(3),
    
    -- Provider details (stored as JSONB)
    details JSONB NOT NULL DEFAULT '{}',
    
    -- Refunds (stored as JSONB array)
    refunds JSONB DEFAULT '[]',
    total_refunded DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_refunded >= 0),
    
    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    authorized_at TIMESTAMP WITH TIME ZONE,
    captured_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional info
    description VARCHAR(500),
    failure_reason VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    
    -- System fields
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_total_refunded_le_amount CHECK (total_refunded <= amount)
);

-- Indexes for payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_amount ON payments(amount);
CREATE INDEX idx_payments_initiated_at ON payments(initiated_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_details ON payments USING GIN(details);
CREATE INDEX idx_payments_metadata ON payments USING GIN(metadata);

-- Provider transaction ID index for lookups
CREATE INDEX idx_payments_provider_transaction_id ON payments((details->>'providerTransactionId')) WHERE details->>'providerTransactionId' IS NOT NULL;

-- ====================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parks_updated_at BEFORE UPDATE ON parks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ====================================

-- Function to calculate user loyalty tier based on total spent
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(total_spent_amount DECIMAL)
RETURNS loyalty_tier AS $$
BEGIN
    IF total_spent_amount >= 100000 THEN -- 100,000 KGS
        RETURN 'vip';
    ELSIF total_spent_amount >= 25000 THEN -- 25,000 KGS
        RETURN 'friend';
    ELSE
        RETURN 'beginner';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user loyalty information
CREATE OR REPLACE FUNCTION update_user_loyalty()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total spent and visits
    UPDATE users SET
        total_spent = (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM bookings 
            WHERE user_id = NEW.user_id AND status = 'completed'
        ),
        total_visits = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE user_id = NEW.user_id AND status = 'completed'
        ),
        last_visit_at = CASE 
            WHEN NEW.status = 'completed' THEN NEW.completed_at 
            ELSE users.last_visit_at 
        END
    WHERE id = NEW.user_id;
    
    -- Update loyalty tier based on new total spent
    UPDATE users SET
        loyalty_tier = calculate_loyalty_tier(total_spent)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user loyalty when booking is completed
CREATE TRIGGER update_user_loyalty_on_booking_completion
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_user_loyalty();

-- ====================================
-- VIEWS FOR ANALYTICS
-- ====================================

-- View for park statistics
CREATE VIEW park_stats AS
SELECT 
    p.id,
    p.name,
    p.status,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as total_revenue,
    COALESCE(AVG(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as avg_booking_value,
    COUNT(DISTINCT t.id) as total_tickets,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'used') as used_tickets,
    p.average_rating,
    p.total_reviews
FROM parks p
LEFT JOIN bookings b ON p.id = b.park_id
LEFT JOIN tickets t ON p.id = t.park_id
GROUP BY p.id, p.name, p.status, p.average_rating, p.total_reviews;

-- View for user statistics  
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.phone_number,
    u.status,
    u.loyalty_tier,
    u.loyalty_points,
    u.total_spent,
    u.total_visits,
    u.last_visit_at,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
    COUNT(DISTINCT t.id) as total_tickets
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN tickets t ON u.id = t.user_id
GROUP BY u.id, u.first_name, u.last_name, u.phone_number, u.status, 
         u.loyalty_tier, u.loyalty_points, u.total_spent, u.total_visits, u.last_visit_at;

-- View for booking analytics
CREATE VIEW booking_analytics AS
SELECT 
    DATE_TRUNC('day', b.visit_date) as visit_date,
    b.park_id,
    p.name as park_name,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'completed') as completed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings,
    SUM(b.total_guests) as total_guests,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as avg_booking_value
FROM bookings b
JOIN parks p ON b.park_id = p.id
GROUP BY DATE_TRUNC('day', b.visit_date), b.park_id, p.name;

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Full-text search indexes
CREATE INDEX idx_users_name_search ON users USING GIN(to_tsvector('russian', first_name || ' ' || last_name));
CREATE INDEX idx_parks_name_search ON parks USING GIN(to_tsvector('russian', name || ' ' || description));

-- Partial indexes for active records
CREATE INDEX idx_users_active ON users(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_parks_active ON parks(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_bookings_pending ON bookings(id) WHERE status IN ('draft', 'pending_payment') AND deleted_at IS NULL;
CREATE INDEX idx_tickets_active ON tickets(id) WHERE status = 'active' AND deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for Sky Park with loyalty program';
COMMENT ON TABLE parks IS 'Children entertainment parks in Bishkek, Kyrgyzstan';
COMMENT ON TABLE bookings IS 'Park visit bookings with QR tickets';
COMMENT ON TABLE tickets IS 'Digital tickets with QR codes';
COMMENT ON TABLE payments IS 'Payments with Kyrgyzstan gateway integration';

COMMENT ON COLUMN users.phone_number IS 'Kyrgyzstan phone number in +996XXXXXXXXX format';
COMMENT ON COLUMN users.loyalty_points IS 'Points earned through bookings and visits';
COMMENT ON COLUMN parks.coordinates IS 'Geographical coordinates for location-based search';
COMMENT ON COLUMN bookings.visit_date IS 'Date of planned park visit';
COMMENT ON COLUMN tickets.qr_code IS 'QR code data for ticket validation';
COMMENT ON COLUMN payments.method IS 'Payment method (ELQR, Elcart, M-Bank, O!Денги, etc.)'; 
 