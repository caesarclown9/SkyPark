-- ===============================================
-- SKYPARK DATABASE SETUP FOR SUPABASE
-- Полная схема для детских развлекательных центров в Кыргызстане
-- ===============================================

-- Включение необходимых расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- СОЗДАНИЕ ENUM ТИПОВ
-- ===============================================

-- Статусы пользователей
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending', 'deleted');

-- Уровни лояльности
CREATE TYPE loyalty_tier AS ENUM ('beginner', 'friend', 'vip');

-- Пол
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'not_stated');

-- Статусы парков
CREATE TYPE park_status AS ENUM ('active', 'inactive', 'maintenance', 'closed');

-- Дни недели
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Типы удобств
CREATE TYPE amenity_type AS ENUM ('parking', 'wifi', 'restaurant', 'cafe', 'shop', 'restroom', 'baby_room', 'first_aid', 'accessibility', 'security', 'playground', 'entertainment');

-- Статусы билетов
CREATE TYPE ticket_status AS ENUM ('pending', 'active', 'used', 'expired', 'cancelled', 'refunded');

-- Типы билетов
CREATE TYPE ticket_type AS ENUM ('single', 'group', 'family', 'vip', 'unlimited');

-- Возрастные категории
CREATE TYPE age_category AS ENUM ('baby', 'child', 'teen', 'adult', 'senior');

-- Статусы бронирований
CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'no_show');

-- Статусы платежей
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'expired');

-- Источники бронирований
CREATE TYPE booking_source AS ENUM ('web', 'mobile', 'admin', 'partner', 'walk_in');

-- Методы платежей (для Кыргызстана)
CREATE TYPE payment_method AS ENUM ('elqr', 'elcart', 'mbank', 'odengi', 'bank_card', 'cash', 'loyalty_points', 'wallet');

-- Провайдеры платежей
CREATE TYPE payment_provider AS ENUM ('elqr', 'elcart', 'mbank', 'odengi', 'visa', 'mastercard', 'internal');

-- Причины возврата
CREATE TYPE refund_reason AS ENUM ('user_request', 'booking_cancelled', 'park_closure', 'technical_issue', 'overbooking', 'admin_action');

-- ===============================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ===============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Основная информация
    phone_number VARCHAR(20) UNIQUE NOT NULL CHECK (phone_number ~ '^\+996[0-9]{9}$'),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender gender,
    avatar_url TEXT,
    
    -- Статус и верификация
    status user_status NOT NULL DEFAULT 'active',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Программа лояльности
    loyalty_tier loyalty_tier NOT NULL DEFAULT 'beginner',
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    total_spent DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
    last_visit_at TIMESTAMP WITH TIME ZONE,
    
    -- Настройки и предпочтения
    preferred_language VARCHAR(2) NOT NULL DEFAULT 'ru' CHECK (preferred_language IN ('ru', 'ky')),
    
    -- Настройки уведомлений
    notifications_email BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_sms BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_push BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Приватность
    profile_visible BOOLEAN NOT NULL DEFAULT TRUE,
    activity_visible BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Экстренный контакт
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20) CHECK (emergency_contact_phone IS NULL OR emergency_contact_phone ~ '^\+996[0-9]{9}$'),
    
    -- Реферальная система
    referral_code VARCHAR(10) UNIQUE,
    referred_by UUID REFERENCES users(id),
    
    -- Системные поля
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255),
    refresh_token TEXT,
    refresh_token_expiry TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для пользователей
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_loyalty_tier ON users(loyalty_tier);
CREATE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);
CREATE INDEX idx_users_name_search ON users USING GIN(to_tsvector('russian', first_name || ' ' || last_name));

-- ===============================================
-- ТАБЛИЦА ПАРКОВ
-- ===============================================
CREATE TABLE parks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Основная информация
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    status park_status NOT NULL DEFAULT 'active',
    
    -- Локация (в формате JSONB для гибкости)
    address JSONB NOT NULL,
    coordinates JSONB NOT NULL,
    
    -- Контактная информация
    phone_number VARCHAR(20) CHECK (phone_number IS NULL OR phone_number ~ '^\+996[0-9]{9}$'),
    email VARCHAR(255) CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    website TEXT,
    
    -- Рабочие часы и удобства (в формате JSONB)
    operating_hours JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    
    -- Вместимость
    capacity JSONB NOT NULL DEFAULT '{"total": 100, "current": 0, "reserved": 0, "available": 100}',
    
    -- Медиа
    main_image_url TEXT,
    images JSONB DEFAULT '[]',
    video_url TEXT,
    
    -- Ценообразование (базовые цены в сомах)
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    child_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (child_price >= 0),
    adult_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (adult_price >= 0),
    senior_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (senior_price >= 0),
    group_discount DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (group_discount >= 0 AND group_discount <= 100),
    
    -- Особенности
    features JSONB DEFAULT '[]',
    age_groups JSONB DEFAULT '[]',
    
    -- Удобства (булевы флаги для быстрого поиска)
    has_parking BOOLEAN NOT NULL DEFAULT FALSE,
    has_wifi BOOLEAN NOT NULL DEFAULT FALSE,
    has_restaurant BOOLEAN NOT NULL DEFAULT FALSE,
    has_cafe BOOLEAN NOT NULL DEFAULT FALSE,
    has_shop BOOLEAN NOT NULL DEFAULT FALSE,
    has_restroom BOOLEAN NOT NULL DEFAULT TRUE,
    has_baby_room BOOLEAN NOT NULL DEFAULT FALSE,
    has_first_aid BOOLEAN NOT NULL DEFAULT TRUE,
    is_wheelchair_accessible BOOLEAN NOT NULL DEFAULT FALSE,
    allows_outside_food BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Статистика
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
    total_visitors INTEGER NOT NULL DEFAULT 0 CHECK (total_visitors >= 0),
    monthly_visitors INTEGER NOT NULL DEFAULT 0 CHECK (monthly_visitors >= 0),
    
    -- Системные поля
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для парков
CREATE INDEX idx_parks_name ON parks(name);
CREATE INDEX idx_parks_status ON parks(status);
CREATE INDEX idx_parks_coordinates ON parks USING GIN(coordinates);
CREATE INDEX idx_parks_address ON parks USING GIN(address);
CREATE INDEX idx_parks_average_rating ON parks(average_rating);
CREATE INDEX idx_parks_is_featured ON parks(is_featured);
CREATE INDEX idx_parks_created_at ON parks(created_at);
CREATE INDEX idx_parks_deleted_at ON parks(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_parks_metadata ON parks USING GIN(metadata);
CREATE INDEX idx_parks_name_search ON parks USING GIN(to_tsvector('russian', name || ' ' || COALESCE(description, '')));

-- ===============================================
-- ТАБЛИЦА БРОНИРОВАНИЙ
-- ===============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    park_id UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    
    -- Статусы
    status booking_status NOT NULL DEFAULT 'draft',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    source booking_source NOT NULL DEFAULT 'web',
    
    -- Детали бронирования
    visit_date DATE NOT NULL,
    time_slot VARCHAR(5) CHECK (time_slot IS NULL OR time_slot ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    duration INTEGER NOT NULL DEFAULT 180 CHECK (duration >= 30), -- минуты
    
    -- Билеты (хранятся как JSONB массив)
    items JSONB NOT NULL DEFAULT '[]',
    total_guests INTEGER NOT NULL CHECK (total_guests >= 1),
    
    -- Ценообразование
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    
    -- Скидки и лояльность
    discounts JSONB DEFAULT '[]',
    loyalty_points_used INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points_used >= 0),
    loyalty_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points_earned >= 0),
    promo_code VARCHAR(50),
    
    -- Контактная информация (в формате JSONB)
    contact_info JSONB NOT NULL,
    
    -- Особые требования
    special_requirements TEXT[] DEFAULT '{}',
    notes TEXT,
    staff_notes TEXT,
    
    -- Временные метки и отслеживание
    booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Информация об отмене
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    refund_amount DECIMAL(12,2) CHECK (refund_amount >= 0),
    refund_reason TEXT,
    
    -- Системные поля
    metadata JSONB DEFAULT '{}',
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для бронирований
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_park_id ON bookings(park_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_visit_date ON bookings(visit_date);
CREATE INDEX idx_bookings_booked_at ON bookings(booked_at);
CREATE INDEX idx_bookings_total_amount ON bookings(total_amount);
CREATE INDEX idx_bookings_promo_code ON bookings(promo_code) WHERE promo_code IS NOT NULL;
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bookings_metadata ON bookings USING GIN(metadata);
CREATE INDEX idx_bookings_contact_info ON bookings USING GIN(contact_info);

-- Композитные индексы для улучшения производительности
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_park_visit_date ON bookings(park_id, visit_date);
CREATE INDEX idx_bookings_park_status ON bookings(park_id, status);

-- ===============================================
-- ТАБЛИЦА БИЛЕТОВ
-- ===============================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    park_id UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Типы и категории
    type ticket_type NOT NULL,
    age_category age_category NOT NULL,
    status ticket_status NOT NULL DEFAULT 'pending',
    
    -- Детали билета
    title VARCHAR(255) NOT NULL,
    description TEXT,
    holder_name VARCHAR(255) NOT NULL,
    holder_age INTEGER CHECK (holder_age >= 0 AND holder_age <= 120),
    
    -- Ценообразование
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) NOT NULL CHECK (original_price >= 0),
    discount DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    
    -- Срок действия
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    max_usages INTEGER NOT NULL DEFAULT 1 CHECK (max_usages >= 1),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    
    -- QR код (в формате JSONB)
    qr_code JSONB NOT NULL,
    
    -- Валидации (история использования)
    validations JSONB DEFAULT '[]',
    
    -- Особые требования
    special_requirements TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- Системные поля
    metadata JSONB DEFAULT '{}',
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для билетов
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

-- Уникальный индекс для QR кода
CREATE UNIQUE INDEX idx_tickets_qr_code_unique ON tickets((qr_code->>'code')) WHERE deleted_at IS NULL;

-- ===============================================
-- ТАБЛИЦА ПЛАТЕЖЕЙ
-- ===============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Детали платежа
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Суммы (в сомах)
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    original_amount DECIMAL(12,2) NOT NULL CHECK (original_amount >= 0),
    fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    net_amount DECIMAL(12,2) NOT NULL CHECK (net_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    
    -- Курс обмена (если применимо)
    exchange_rate DECIMAL(10,4),
    original_currency VARCHAR(3),
    
    -- Детали провайдера (в формате JSONB)
    details JSONB NOT NULL DEFAULT '{}',
    
    -- Возвраты (в формате JSONB массив)
    refunds JSONB DEFAULT '[]',
    total_refunded DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_refunded >= 0),
    
    -- Временные метки
    initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    authorized_at TIMESTAMP WITH TIME ZONE,
    captured_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Дополнительная информация
    description TEXT,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Системные поля
    metadata JSONB DEFAULT '{}',
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для платежей
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_amount ON payments(amount);
CREATE INDEX idx_payments_initiated_at ON payments(initiated_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_details ON payments USING GIN(details);
CREATE INDEX idx_payments_metadata ON payments USING GIN(metadata);

-- Уникальный индекс для внешнего ID транзакции
CREATE UNIQUE INDEX idx_payments_provider_transaction_id ON payments((details->>'providerTransactionId')) WHERE details->>'providerTransactionId' IS NOT NULL;

-- ===============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ===============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parks_updated_at BEFORE UPDATE ON parks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для вычисления уровня лояльности
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(total_spent_amount DECIMAL, total_visits_count INTEGER)
RETURNS loyalty_tier AS $$
BEGIN
    IF total_spent_amount >= 50000 OR total_visits_count >= 20 THEN
        RETURN 'vip';
    ELSIF total_spent_amount >= 10000 OR total_visits_count >= 5 THEN
        RETURN 'friend';
    ELSE
        RETURN 'beginner';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления лояльности пользователя
CREATE OR REPLACE FUNCTION update_user_loyalty()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET 
        total_spent = total_spent + NEW.total_amount,
        total_visits = total_visits + 1,
        last_visit_at = NEW.visit_date,
        loyalty_tier = calculate_loyalty_tier(total_spent + NEW.total_amount, total_visits + 1)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления лояльности при завершении бронирования
CREATE TRIGGER update_user_loyalty_on_booking_completion
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_user_loyalty();

-- Функция для генерации реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code = UPPER(substring(encode(gen_random_bytes(5), 'base64') from 1 for 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для генерации реферального кода
CREATE TRIGGER generate_referral_code_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- ===============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ===============================================

-- Статистика парков
CREATE VIEW park_stats AS
SELECT 
    p.id,
    p.name,
    p.status,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount END), 0) as total_revenue,
    COUNT(DISTINCT b.user_id) as unique_visitors,
    p.average_rating,
    p.total_reviews
FROM parks p
LEFT JOIN bookings b ON p.id = b.park_id AND b.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.status, p.average_rating, p.total_reviews;

-- Статистика пользователей
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.phone_number,
    u.loyalty_tier,
    u.loyalty_points,
    u.total_spent,
    u.total_visits,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings,
    u.last_visit_at,
    u.created_at as registration_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id AND b.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name, u.phone_number, u.loyalty_tier, 
         u.loyalty_points, u.total_spent, u.total_visits, u.last_visit_at, u.created_at;

-- Аналитика бронирований
CREATE VIEW booking_analytics AS
SELECT 
    DATE_TRUNC('month', b.visit_date) as month,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as average_booking_value,
    COUNT(DISTINCT b.user_id) as unique_customers
FROM bookings b
WHERE b.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', b.visit_date)
ORDER BY month DESC;

-- ===============================================
-- ПОЛИТИКИ БЕЗОПАСНОСТИ RLS
-- ===============================================

-- Включение RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Пользователи могут видеть свои данные" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Пользователи могут обновлять свои данные" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Публичные профили видны всем" ON users
    FOR SELECT USING (profile_visible = true);

-- Политики для таблицы parks
CREATE POLICY "Парки видны всем" ON parks
    FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

-- Политики для таблицы bookings
CREATE POLICY "Пользователи видят свои бронирования" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать бронирования" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои бронирования" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Политики для таблицы tickets
CREATE POLICY "Пользователи видят свои билеты" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Политики для таблицы payments
CREATE POLICY "Пользователи видят свои платежи" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- ===============================================
-- ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ===============================================

-- Индексы для активных записей (наиболее часто используемые)
CREATE INDEX idx_users_active ON users(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_parks_active ON parks(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_bookings_pending ON bookings(id) WHERE status IN ('draft', 'pending_payment') AND deleted_at IS NULL;
CREATE INDEX idx_tickets_active ON tickets(id) WHERE status = 'active' AND deleted_at IS NULL;

-- Композитные индексы для отчетности
CREATE INDEX idx_bookings_analytics ON bookings(visit_date, status, total_amount) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_analytics ON payments(created_at, status, amount, method);

-- ===============================================
-- ФУНКЦИИ ДЛЯ API
-- ===============================================

-- Функция поиска парков
CREATE OR REPLACE FUNCTION search_parks(
    search_text TEXT DEFAULT NULL,
    city_filter TEXT DEFAULT NULL,
    min_rating DECIMAL DEFAULT NULL,
    has_parking_filter BOOLEAN DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    short_description VARCHAR(500),
    address JSONB,
    coordinates JSONB,
    average_rating DECIMAL(3,2),
    base_price DECIMAL(10,2),
    main_image_url TEXT,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.short_description,
        p.address,
        p.coordinates,
        p.average_rating,
        p.base_price,
        p.main_image_url,
        NULL::DECIMAL as distance_km
    FROM parks p
    WHERE 
        p.status = 'active' 
        AND p.deleted_at IS NULL
        AND (search_text IS NULL OR p.name ILIKE '%' || search_text || '%' OR p.description ILIKE '%' || search_text || '%')
        AND (city_filter IS NULL OR p.address->>'city' = city_filter)
        AND (min_rating IS NULL OR p.average_rating >= min_rating)
        AND (has_parking_filter IS NULL OR p.has_parking = has_parking_filter)
    ORDER BY p.average_rating DESC, p.name
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Функция получения статистики пользователя
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(stats) INTO result
    FROM (
        SELECT 
            COUNT(DISTINCT b.id) as total_bookings,
            COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
            COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount END), 0) as total_spent,
            COUNT(DISTINCT b.park_id) as parks_visited,
            u.loyalty_tier,
            u.loyalty_points,
            u.total_visits
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id AND b.deleted_at IS NULL
        WHERE u.id = user_uuid AND u.deleted_at IS NULL
        GROUP BY u.id, u.loyalty_tier, u.loyalty_points, u.total_visits
    ) stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки доступности парка
CREATE OR REPLACE FUNCTION check_park_availability(
    park_uuid UUID,
    visit_date DATE,
    guest_count INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    park_capacity JSONB;
    current_bookings INTEGER;
    available_spots INTEGER;
BEGIN
    -- Получаем информацию о вместимости парка
    SELECT capacity INTO park_capacity 
    FROM parks 
    WHERE id = park_uuid AND status = 'active' AND deleted_at IS NULL;
    
    IF park_capacity IS NULL THEN
        RETURN '{"available": false, "reason": "Park not found or inactive"}'::JSON;
    END IF;
    
    -- Считаем текущие бронирования на эту дату
    SELECT COALESCE(SUM(total_guests), 0) INTO current_bookings
    FROM bookings 
    WHERE 
        park_id = park_uuid 
        AND visit_date = check_park_availability.visit_date
        AND status IN ('confirmed', 'checked_in')
        AND deleted_at IS NULL;
    
    -- Вычисляем доступные места
    available_spots := (park_capacity->>'total')::INTEGER - current_bookings;
    
    SELECT row_to_json(availability) INTO result
    FROM (
        SELECT 
            (available_spots >= guest_count) as available,
            available_spots,
            current_bookings,
            (park_capacity->>'total')::INTEGER as total_capacity,
            CASE 
                WHEN available_spots >= guest_count THEN 'Available'
                ELSE 'Not enough capacity'
            END as reason
    ) availability;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql; 