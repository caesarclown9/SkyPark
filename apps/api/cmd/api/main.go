package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"skypark/internal/auth"
	"skypark/internal/booking"
	"skypark/internal/models"
	"skypark/internal/park"
	"skypark/pkg/config"
)

func main() {
	// Set up logging
	log.Println("🚀 Starting Sky Park API Server...")

	// Connect to database
	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer config.CloseDatabase(db)

	// Run migrations (in development)
	if os.Getenv("APP_ENV") == "development" {
		if err := config.RunMigrations(db); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}

		// Seed database with sample data
		if err := config.SeedDatabase(db); err != nil {
			log.Fatalf("Failed to seed database: %v", err)
		}
	}

	// Initialize authentication services
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "skypark-super-secret-key-for-development-only"
		log.Println("⚠️ Using default JWT secret. Set JWT_SECRET environment variable in production!")
	}

	tokenManager := auth.NewTokenManager(
		jwtSecret,
		15*time.Minute, // Access token TTL: 15 minutes
		7*24*time.Hour, // Refresh token TTL: 7 days
	)

	smsService := auth.NewSMSService()
	authHandlers := auth.NewAuthHandlers(db, tokenManager, smsService)
	authMiddleware := auth.NewAuthMiddleware(tokenManager)

	// Initialize park services
	parkService := park.NewParkService(db)
	parkHandlers := park.NewParkHandlers(db)

	// Initialize booking services
	bookingService := booking.NewBookingService(db)
	bookingHandlers := booking.NewBookingHandlers(db)

	// Seed initial park data
	if os.Getenv("APP_ENV") == "development" {
		if err := parkService.SeedBishkekParks(); err != nil {
			log.Printf("⚠️ Failed to seed park data: %v", err)
		} else {
			log.Println("✅ Park data seeded successfully")
		}

		if err := bookingService.SeedSampleBookings(); err != nil {
			log.Printf("⚠️ Failed to seed booking data: %v", err)
		} else {
			log.Println("✅ Booking data seeded successfully")
		}
	}

	// Set up Gin router
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "Sky Park API",
			"version":   "1.0.0",
			"timestamp": "2025-01-30T12:59:00Z",
			"database":  "connected",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// 🔓 Public authentication routes
		auth := v1.Group("/auth")
		{
			auth.POST("/send-sms", authHandlers.SendSMSCode)
			auth.POST("/verify-login", authHandlers.VerifyAndLogin)
			auth.POST("/refresh", authHandlers.RefreshToken)
		}

		// 🔒 Protected user routes
		user := v1.Group("/user")
		user.Use(authMiddleware.AuthRequired())
		{
			user.GET("/profile", authHandlers.GetProfile)
			user.PUT("/profile", authHandlers.UpdateProfile)
		}

		// 🔓 Public parks routes
		parks := v1.Group("/parks")
		{
			parks.GET("", authMiddleware.OptionalAuth(), parkHandlers.GetParks)
			parks.GET("/:id", authMiddleware.OptionalAuth(), parkHandlers.GetParkByID)
			parks.GET("/nearby", authMiddleware.OptionalAuth(), parkHandlers.GetNearbyParks)
			parks.GET("/districts", parkHandlers.GetBishkekDistricts)
		}

		// 🔒 Booking management routes
		bookings := v1.Group("/bookings")
		{
			// 🔓 Public route for checking time slots
			bookings.GET("/parks/:parkId/time-slots", bookingHandlers.GetAvailableTimeSlots)

			// 🔒 Protected booking routes
			bookings.Use(authMiddleware.AuthRequired())
			{
				bookings.POST("", bookingHandlers.CreateBooking)
				bookings.GET("", bookingHandlers.GetUserBookings)
				bookings.GET("/:id", bookingHandlers.GetBookingByID)
				bookings.PUT("/:id", bookingHandlers.UpdateBooking)
				bookings.DELETE("/:id", bookingHandlers.CancelBooking)
			}
		}

		// 🔒 User dashboard routes
		protected := v1.Group("")
		protected.Use(authMiddleware.AuthRequired())
		{
			protected.GET("/tickets", func(c *gin.Context) {
				userID := c.GetString("user_id")
				var tickets []models.Ticket
				db.Where("user_id = ? AND deleted_at IS NULL", userID).Find(&tickets)
				
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data":    tickets,
					"total":   len(tickets),
				})
			})

			protected.GET("/payments", func(c *gin.Context) {
				userID := c.GetString("user_id")
				var payments []models.Payment
				db.Where("user_id = ?", userID).Find(&payments)
				
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data":    payments,
					"total":   len(payments),
				})
			})
		}

		// 🔒 Admin-only routes
		admin := v1.Group("/admin")
		admin.Use(authMiddleware.AuthRequired(), authMiddleware.AdminOnly())
		{
			admin.GET("/users", func(c *gin.Context) {
				var users []models.User
				db.Where("deleted_at IS NULL").Find(&users)
				
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data":    users,
					"total":   len(users),
				})
			})

			// Admin booking management
			adminBookings := admin.Group("/bookings")
			{
				adminBookings.GET("", func(c *gin.Context) {
					var bookings []models.Booking
					db.Where("deleted_at IS NULL").Preload("Park").Preload("User").Find(&bookings)
					
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"data":    bookings,
						"total":   len(bookings),
					})
				})

				adminBookings.GET("/stats", func(c *gin.Context) {
					stats, err := bookingService.GetBookingStats()
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"success": false,
							"error":   err.Error(),
						})
						return
					}
					
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"data":    stats,
					})
				})

				adminBookings.PUT("/:id/confirm", func(c *gin.Context) {
					bookingID := c.Param("id")
					if err := bookingService.ConfirmBooking(bookingID); err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"success": false,
							"error":   err.Error(),
						})
						return
					}
					
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"message": "Booking confirmed successfully",
					})
				})

				adminBookings.PUT("/:id/complete", func(c *gin.Context) {
					bookingID := c.Param("id")
					if err := bookingService.CompleteBooking(bookingID); err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"success": false,
							"error":   err.Error(),
						})
						return
					}
					
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"message": "Booking completed successfully",
					})
				})

				adminBookings.PUT("/:id/reject", func(c *gin.Context) {
					bookingID := c.Param("id")
					var req struct {
						Reason string `json:"reason" binding:"required"`
					}
					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"success": false,
							"error":   "Invalid request",
						})
						return
					}

					if err := bookingService.RejectBooking(bookingID, req.Reason); err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"success": false,
							"error":   err.Error(),
						})
						return
					}
					
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"message": "Booking rejected successfully",
					})
				})
			}

			// Admin park management
			adminParks := admin.Group("/parks")
			{
				adminParks.POST("", parkHandlers.CreatePark)
				adminParks.PUT("/:id", parkHandlers.UpdatePark)
				adminParks.DELETE("/:id", parkHandlers.DeletePark)
			}
		}
	}

	// WebSocket endpoint for real-time updates
	router.GET("/ws", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "WebSocket endpoint - coming soon",
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🌟 Server running on port %s", port)
	log.Printf("🔗 Health check: http://localhost:%s/health", port)
	log.Printf("📚 API documentation: http://localhost:%s/api/v1", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
} 
	