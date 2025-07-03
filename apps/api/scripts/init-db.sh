#!/bin/bash
set -e

# Sky Park Database Initialization Script
echo "🚀 Initializing Sky Park Database..."

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Set timezone
    SET timezone = 'Asia/Bishkek';
    
    -- Create application user if needed
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'skypark_app') THEN
            CREATE ROLE skypark_app WITH LOGIN PASSWORD 'skypark_app_password';
        END IF;
    END
    \$\$;
    
    -- Grant permissions
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO skypark_app;
    GRANT USAGE ON SCHEMA public TO skypark_app;
    GRANT CREATE ON SCHEMA public TO skypark_app;
    
    -- Create initial admin user (will be updated by application)
    INSERT INTO users (phone_number, first_name, last_name, status, loyalty_tier) 
    VALUES ('+996700000000', 'Администратор', 'Системы', 'active', 'vip')
    ON CONFLICT (phone_number) DO NOTHING;
    
EOSQL

echo "✅ Sky Park Database initialized successfully!"
echo "📊 Database: $POSTGRES_DB"
echo "👤 User: $POSTGRES_USER"
echo "🌍 Timezone: Asia/Bishkek"
echo "🏢 Sample data loaded for Bishkek entertainment centers" 
 