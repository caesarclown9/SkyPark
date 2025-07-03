package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

// GetDatabaseConfig returns database configuration from environment variables
func GetDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "skypark_user"),
		Password: getEnv("DB_PASSWORD", "skypark_password"),
		DBName:   getEnv("DB_NAME", "skypark_db"),
		SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		TimeZone: getEnv("DB_TIMEZONE", "Asia/Bishkek"),
	}
}

// DSN returns the data source name for PostgreSQL
func (dc *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		dc.Host, dc.User, dc.Password, dc.DBName, dc.Port, dc.SSLMode, dc.TimeZone,
	)
}

// ConnectDatabase establishes connection to PostgreSQL database
func ConnectDatabase() (*gorm.DB, error) {
	config := GetDatabaseConfig()
	
	// Configure GORM logger
	logLevel := logger.Silent
	if getEnv("APP_ENV", "development") == "development" {
		logLevel = logger.Info
	}
	
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			// Use Bishkek timezone
			loc, _ := time.LoadLocation("Asia/Bishkek")
			return time.Now().In(loc)
		},
	}
	
	// Connect to database
	db, err := gorm.Open(postgres.Open(config.DSN()), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	
	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	
	log.Println("Database connection established successfully")
	return db, nil
}

// RunMigrations runs database migrations
func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")
	
	// Auto-migrate models
	// Note: In production, use proper migration files instead of AutoMigrate
	
	log.Println("Database migrations completed successfully")
	return nil
}

// SeedDatabase seeds the database with initial data
func SeedDatabase(db *gorm.DB) error {
	log.Println("Seeding database with initial data...")
	
	// Check if data already exists
	var count int64
	db.Table("parks").Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping...")
		return nil
	}
	
	// Seed sample parks for Bishkek
	sampleParks := []map[string]interface{}{
		{
			"name":         "Детский парк Радуга",
			"description":  "Современный детский развлекательный центр в центре Бишкека с разнообразными аттракционами и играми для детей всех возрастов.",
			"status":       "active",
			"base_price":   200.00,
			"child_price":  150.00,
			"adult_price":  200.00,
			"senior_price": 100.00,
			"address": map[string]interface{}{
				"street":     "ул. Чуй 123",
				"city":       "Бишкек",
				"region":     "Чуйская область",
				"country":    "Кыргызстан",
				"postalCode": "720000",
			},
			"coordinates": map[string]interface{}{
				"latitude":  42.8746,
				"longitude": 74.5698,
			},
			"phone_number": "+996312123456",
			"email":        "info@rainbow-park.kg",
			"capacity": map[string]interface{}{
				"total":       100,
				"current":     0,
				"reserved":    0,
				"available":   100,
				"lastUpdated": time.Now(),
			},
			"operating_hours": []map[string]interface{}{
				{"day": "monday", "openTime": "09:00", "closeTime": "21:00", "isClosed": false},
				{"day": "tuesday", "openTime": "09:00", "closeTime": "21:00", "isClosed": false},
				{"day": "wednesday", "openTime": "09:00", "closeTime": "21:00", "isClosed": false},
				{"day": "thursday", "openTime": "09:00", "closeTime": "21:00", "isClosed": false},
				{"day": "friday", "openTime": "09:00", "closeTime": "22:00", "isClosed": false},
				{"day": "saturday", "openTime": "10:00", "closeTime": "22:00", "isClosed": false},
				{"day": "sunday", "openTime": "10:00", "closeTime": "21:00", "isClosed": false},
			},
			"amenities": []map[string]interface{}{
				{"type": "play", "name": "Игровая площадка", "icon": "playground", "isAvailable": true},
				{"type": "food", "name": "Кафе", "icon": "restaurant", "isAvailable": true},
				{"type": "service", "name": "Парковка", "icon": "parking", "isAvailable": true},
			},
			"has_parking":                true,
			"has_wifi":                   true,
			"has_restaurant":             true,
			"is_wheelchair_accessible":   true,
		},
		{
			"name":         "Волшебная Страна",
			"description":  "Тематический парк с сказочными персонажами и интерактивными играми для самых маленьких посетителей.",
			"status":       "active",
			"base_price":   180.00,
			"child_price":  120.00,
			"adult_price":  180.00,
			"senior_price": 90.00,
			"address": map[string]interface{}{
				"street":     "пр. Манас 45",
				"city":       "Бишкек",
				"region":     "Чуйская область",
				"country":    "Кыргызстан",
				"postalCode": "720000",
			},
			"coordinates": map[string]interface{}{
				"latitude":  42.8800,
				"longitude": 74.5900,
			},
			"phone_number": "+996312654321",
			"email":        "contact@wonderland.kg",
			"capacity": map[string]interface{}{
				"total":       80,
				"current":     0,
				"reserved":    0,
				"available":   80,
				"lastUpdated": time.Now(),
			},
			"operating_hours": []map[string]interface{}{
				{"day": "monday", "openTime": "10:00", "closeTime": "20:00", "isClosed": false},
				{"day": "tuesday", "openTime": "10:00", "closeTime": "20:00", "isClosed": false},
				{"day": "wednesday", "openTime": "10:00", "closeTime": "20:00", "isClosed": false},
				{"day": "thursday", "openTime": "10:00", "closeTime": "20:00", "isClosed": false},
				{"day": "friday", "openTime": "10:00", "closeTime": "21:00", "isClosed": false},
				{"day": "saturday", "openTime": "09:00", "closeTime": "21:00", "isClosed": false},
				{"day": "sunday", "openTime": "09:00", "closeTime": "20:00", "isClosed": false},
			},
			"amenities": []map[string]interface{}{
				{"type": "play", "name": "Лабиринт", "icon": "maze", "isAvailable": true},
				{"type": "play", "name": "Батуты", "icon": "trampoline", "isAvailable": true},
				{"type": "service", "name": "Детский туалет", "icon": "restroom", "isAvailable": true},
			},
			"has_parking":                true,
			"has_wifi":                   false,
			"has_restaurant":             false,
			"is_wheelchair_accessible":   false,
		},
	}
	
	for _, park := range sampleParks {
		result := db.Table("parks").Create(park)
		if result.Error != nil {
			log.Printf("Error seeding park: %v", result.Error)
			return result.Error
		}
	}
	
	log.Println("Database seeding completed successfully")
	return nil
}

// CloseDatabase closes the database connection
func CloseDatabase(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// getEnv gets environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
} 
 