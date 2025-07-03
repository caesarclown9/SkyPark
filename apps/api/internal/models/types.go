package models

import (
	"time"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ====================================
// COMMON TYPES
// ====================================

// BaseModel contains common fields for all models
type BaseModel struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CreatedAt time.Time  `json:"createdAt" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" gorm:"index"`
}

// Coordinates represents geographical coordinates
type Coordinates struct {
	Latitude  float64 `json:"latitude" validate:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" validate:"required,min=-180,max=180"`
}

// Scan implements the Scanner interface for database reading
func (c *Coordinates) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, c)
	case string:
		return json.Unmarshal([]byte(v), c)
	default:
		return errors.New("cannot scan coordinates")
	}
}

// Value implements the Valuer interface for database writing
func (c Coordinates) Value() (driver.Value, error) {
	return json.Marshal(c)
}

// StringArray represents an array of strings for PostgreSQL
type StringArray pq.StringArray

func (s *StringArray) Scan(value interface{}) error {
	return (*pq.StringArray)(s).Scan(value)
}

func (s StringArray) Value() (driver.Value, error) {
	return pq.StringArray(s).Value()
}

// JSONB represents a JSONB field
type JSONB map[string]interface{}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, j)
	case string:
		return json.Unmarshal([]byte(v), j)
	default:
		return errors.New("cannot scan JSONB")
	}
}

func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// ====================================
// USER TYPES
// ====================================

type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
	UserStatusPending   UserStatus = "pending"
)

type LoyaltyTier string

const (
	LoyaltyTierBeginner LoyaltyTier = "beginner"
	LoyaltyTierFriend   LoyaltyTier = "friend"
	LoyaltyTierVIP      LoyaltyTier = "vip"
)

type Gender string

const (
	GenderMale      Gender = "male"
	GenderFemale    Gender = "female"
	GenderOther     Gender = "other"
	GenderNotStated Gender = "not_stated"
)

type UserRole string

const (
	UserRoleCustomer UserRole = "customer"
	UserRoleStaff    UserRole = "staff"
	UserRoleAdmin    UserRole = "admin"
	UserRoleManager  UserRole = "manager"
)

// User represents a user in the system
type User struct {
	BaseModel
	PhoneNumber      string      `json:"phoneNumber" gorm:"unique;not null" validate:"required,e164"`
	Email            *string     `json:"email,omitempty" gorm:"unique" validate:"omitempty,email"`
	FirstName        string      `json:"firstName" gorm:"not null" validate:"required,max=100"`
	LastName         string      `json:"lastName" gorm:"not null" validate:"required,max=100"`
	DateOfBirth      *time.Time  `json:"dateOfBirth,omitempty"`
	Gender           *Gender     `json:"gender,omitempty"`
	Avatar           *string     `json:"avatar,omitempty"`
	Status           UserStatus  `json:"status" gorm:"default:active"`
	Role             UserRole    `json:"role" gorm:"default:customer"`
	IsEmailVerified  bool        `json:"isEmailVerified" gorm:"default:false"`
	IsPhoneVerified  bool        `json:"isPhoneVerified" gorm:"default:false"`
	
	// Loyalty program
	LoyaltyTier         LoyaltyTier `json:"loyaltyTier" gorm:"default:beginner"`
	LoyaltyPoints       int         `json:"loyaltyPoints" gorm:"default:0"`
	TotalSpent          float64     `json:"totalSpent" gorm:"default:0"`
	TotalVisits         int         `json:"totalVisits" gorm:"default:0"`
	LastVisitAt         *time.Time  `json:"lastVisitAt,omitempty"`
	
	// Preferences
	PreferredLanguage   string      `json:"preferredLanguage" gorm:"default:ru"`
	NotificationsEnabled bool        `json:"notificationsEnabled" gorm:"default:true"`
	EmailNotifications  bool        `json:"emailNotifications" gorm:"default:true"`
	SMSNotifications    bool        `json:"smsNotifications" gorm:"default:true"`
	PushNotifications   bool        `json:"pushNotifications" gorm:"default:true"`
	
	// Emergency contact
	EmergencyContactName  *string `json:"emergencyContactName,omitempty" validate:"omitempty,max=255"`
	EmergencyContactPhone *string `json:"emergencyContactPhone,omitempty" validate:"omitempty,e164"`
	
	// System fields
	LastLoginAt       *time.Time `json:"lastLoginAt,omitempty"`
	PasswordHash      *string    `json:"-" gorm:"column:password_hash"`
	RefreshToken      *string    `json:"-"`
	RefreshTokenExpiry *time.Time `json:"-"`
	Metadata          JSONB      `json:"metadata" gorm:"type:jsonb"`
	
	// Relationships
	Bookings []Booking `json:"bookings,omitempty" gorm:"foreignKey:UserID"`
	Tickets  []Ticket  `json:"tickets,omitempty" gorm:"foreignKey:UserID"`
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:UserID"`
}

// ====================================
// PARK TYPES
// ====================================

type ParkStatus string

const (
	ParkStatusActive      ParkStatus = "active"
	ParkStatusInactive    ParkStatus = "inactive"
	ParkStatusMaintenance ParkStatus = "maintenance"
	ParkStatusClosed      ParkStatus = "closed"
)

type DayOfWeek string

const (
	DayMonday    DayOfWeek = "monday"
	DayTuesday   DayOfWeek = "tuesday"
	DayWednesday DayOfWeek = "wednesday"
	DayThursday  DayOfWeek = "thursday"
	DayFriday    DayOfWeek = "friday"
	DaySaturday  DayOfWeek = "saturday"
	DaySunday    DayOfWeek = "sunday"
)

type AmenityType string

const (
	AmenityTypePlay        AmenityType = "play"
	AmenityTypeFood        AmenityType = "food"
	AmenityTypeService     AmenityType = "service"
	AmenityTypeAccessibility AmenityType = "accessibility"
	AmenityTypeEvent       AmenityType = "event"
)

// OperatingHours represents opening hours for a specific day
type OperatingHours struct {
	Day       DayOfWeek `json:"day"`
	OpenTime  string    `json:"openTime" validate:"required"`
	CloseTime string    `json:"closeTime" validate:"required"`
	IsClosed  bool      `json:"isClosed"`
}

// Address represents a physical address
type Address struct {
	Street     string  `json:"street" validate:"required,max=255"`
	City       string  `json:"city" validate:"required,max=100"`
	Region     string  `json:"region" validate:"required,max=100"`
	PostalCode *string `json:"postalCode,omitempty" validate:"omitempty,max=20"`
	Country    string  `json:"country" validate:"required,max=100"`
}

// Amenity represents a park amenity
type Amenity struct {
	Type        AmenityType `json:"type"`
	Name        string      `json:"name" validate:"required,max=255"`
	Description *string     `json:"description,omitempty" validate:"omitempty,max=500"`
	Icon        string      `json:"icon"`
	IsAvailable bool        `json:"isAvailable"`
}

// Capacity represents park capacity information
type Capacity struct {
	Total       int `json:"total" validate:"required,min=1"`
	Current     int `json:"current" validate:"min=0"`
	Reserved    int `json:"reserved" validate:"min=0"`
	Available   int `json:"available" validate:"min=0"`
	LastUpdated time.Time `json:"lastUpdated"`
}

// Park represents a children's entertainment park
type Park struct {
	BaseModel
	Name            string           `json:"name" gorm:"not null" validate:"required,max=255"`
	Description     string           `json:"description" validate:"required,max=2000"`
	ShortDescription *string         `json:"shortDescription,omitempty" validate:"omitempty,max=500"`
	Status          ParkStatus       `json:"status" gorm:"default:active"`
	
	// Location
	Address     Address     `json:"address" gorm:"type:jsonb"`
	Coordinates Coordinates `json:"coordinates" gorm:"type:jsonb"`
	
	// Contact information
	PhoneNumber *string `json:"phoneNumber,omitempty" validate:"omitempty,e164"`
	Email       *string `json:"email,omitempty" validate:"omitempty,email"`
	Website     *string `json:"website,omitempty" validate:"omitempty,url"`
	
	// Operating information
	OperatingHours []OperatingHours `json:"operatingHours" gorm:"type:jsonb"`
	Amenities      []Amenity        `json:"amenities" gorm:"type:jsonb"`
	Capacity       Capacity         `json:"capacity" gorm:"type:jsonb"`
	
	// Media
	MainImage    *string     `json:"mainImage,omitempty"`
	Images       StringArray `json:"images" gorm:"type:text[]"`
	VideoURL     *string     `json:"videoUrl,omitempty" validate:"omitempty,url"`
	
	// Pricing (base prices in KGS)
	BasePrice       float64 `json:"basePrice" validate:"min=0"`
	ChildPrice      float64 `json:"childPrice" validate:"min=0"`
	AdultPrice      float64 `json:"adultPrice" validate:"min=0"`
	SeniorPrice     float64 `json:"seniorPrice" validate:"min=0"`
	GroupDiscount   float64 `json:"groupDiscount" validate:"min=0,max=100"`
	
	// Features
	HasParking         bool `json:"hasParking" gorm:"default:false"`
	HasWiFi           bool `json:"hasWiFi" gorm:"default:false"`
	HasRestaurant     bool `json:"hasRestaurant" gorm:"default:false"`
	HasGiftShop       bool `json:"hasGiftShop" gorm:"default:false"`
	IsWheelchairAccessible bool `json:"isWheelchairAccessible" gorm:"default:false"`
	AllowsOutsideFood bool `json:"allowsOutsideFood" gorm:"default:false"`
	
	// Statistics
	AverageRating   float64 `json:"averageRating" gorm:"default:0"`
	TotalReviews    int     `json:"totalReviews" gorm:"default:0"`
	TotalVisitors   int     `json:"totalVisitors" gorm:"default:0"`
	MonthlyVisitors int     `json:"monthlyVisitors" gorm:"default:0"`
	
	// System fields
	Metadata JSONB `json:"metadata" gorm:"type:jsonb"`
	
	// Relationships
	Bookings []Booking `json:"bookings,omitempty" gorm:"foreignKey:ParkID"`
	Tickets  []Ticket  `json:"tickets,omitempty" gorm:"foreignKey:ParkID"`
}

// ====================================
// TICKET TYPES
// ====================================

type TicketStatus string

const (
	TicketStatusPending   TicketStatus = "pending"
	TicketStatusActive    TicketStatus = "active"
	TicketStatusUsed      TicketStatus = "used"
	TicketStatusExpired   TicketStatus = "expired"
	TicketStatusCancelled TicketStatus = "cancelled"
	TicketStatusRefunded  TicketStatus = "refunded"
)

type TicketType string

const (
	TicketTypeSingle    TicketType = "single"
	TicketTypeGroup     TicketType = "group"
	TicketTypeFamily    TicketType = "family"
	TicketTypeVIP       TicketType = "vip"
	TicketTypeUnlimited TicketType = "unlimited"
)

type AgeCategory string

const (
	AgeCategoryBaby   AgeCategory = "baby"
	AgeCategoryChild  AgeCategory = "child"
	AgeCategoryTeen   AgeCategory = "teen"
	AgeCategoryAdult  AgeCategory = "adult"
	AgeCategorySenior AgeCategory = "senior"
)

// QRCode represents QR code information
type QRCode struct {
	Code                   string    `json:"code" validate:"required"`
	Data                   string    `json:"data" validate:"required"`
	Format                 string    `json:"format" validate:"required,oneof=png svg jpeg"`
	Size                   int       `json:"size" validate:"min=64,max=1024"`
	ErrorCorrectionLevel   string    `json:"errorCorrectionLevel" validate:"oneof=L M Q H"`
	GeneratedAt           time.Time `json:"generatedAt"`
	ExpiresAt             *time.Time `json:"expiresAt,omitempty"`
}

// TicketValidation represents a ticket validation event
type TicketValidation struct {
	TicketID    uuid.UUID `json:"ticketId"`
	ParkID      uuid.UUID `json:"parkId"`
	ValidatedAt time.Time `json:"validatedAt"`
	ValidatedBy uuid.UUID `json:"validatedBy"`
	DeviceID    *string   `json:"deviceId,omitempty"`
	Location    *string   `json:"location,omitempty"`
	Metadata    JSONB     `json:"metadata" gorm:"type:jsonb"`
}

// Ticket represents an admission ticket
type Ticket struct {
	BaseModel
	BookingID   uuid.UUID     `json:"bookingId" gorm:"not null"`
	ParkID      uuid.UUID     `json:"parkId" gorm:"not null"`
	UserID      uuid.UUID     `json:"userId" gorm:"not null"`
	Type        TicketType    `json:"type" gorm:"not null"`
	AgeCategory AgeCategory   `json:"ageCategory" gorm:"not null"`
	Status      TicketStatus  `json:"status" gorm:"default:pending"`
	
	// Ticket details
	Title           string  `json:"title" validate:"required,max=255"`
	Description     *string `json:"description,omitempty" validate:"omitempty,max=1000"`
	Price           float64 `json:"price" validate:"min=0"`
	OriginalPrice   float64 `json:"originalPrice" validate:"min=0"`
	Currency        string  `json:"currency" gorm:"default:KGS"`
	Discount        float64 `json:"discount" validate:"min=0,max=100"`
	
	// Validity
	ValidFrom   time.Time `json:"validFrom"`
	ValidTo     time.Time `json:"validTo"`
	MaxUsages   int       `json:"maxUsages" gorm:"default:1"`
	UsageCount  int       `json:"usageCount" gorm:"default:0"`
	
	// QR Code
	QRCode QRCode `json:"qrCode" gorm:"type:jsonb"`
	
	// Validation history
	Validations []TicketValidation `json:"validations" gorm:"type:jsonb"`
	
	// Additional info
	HolderName           string      `json:"holderName" validate:"required,max=255"`
	HolderAge           *int        `json:"holderAge,omitempty" validate:"omitempty,min=0,max=120"`
	SpecialRequirements StringArray `json:"specialRequirements" gorm:"type:text[]"`
	Notes               *string     `json:"notes,omitempty" validate:"omitempty,max=500"`
	
	// System fields
	Metadata JSONB `json:"metadata" gorm:"type:jsonb"`
	
	// Relationships
	Booking *Booking `json:"booking,omitempty" gorm:"foreignKey:BookingID"`
	Park    *Park    `json:"park,omitempty" gorm:"foreignKey:ParkID"`
	User    *User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// ====================================
// BOOKING TYPES
// ====================================

type BookingStatus string

const (
	BookingStatusDraft          BookingStatus = "draft"
	BookingStatusPendingPayment BookingStatus = "pending_payment"
	BookingStatusConfirmed      BookingStatus = "confirmed"
	BookingStatusCheckedIn      BookingStatus = "checked_in"
	BookingStatusCompleted      BookingStatus = "completed"
	BookingStatusCancelled      BookingStatus = "cancelled"
	BookingStatusRefunded       BookingStatus = "refunded"
	BookingStatusNoShow         BookingStatus = "no_show"
)

type PaymentStatus string

const (
	PaymentStatusPending          PaymentStatus = "pending"
	PaymentStatusProcessing       PaymentStatus = "processing"
	PaymentStatusCompleted        PaymentStatus = "completed"
	PaymentStatusFailed           PaymentStatus = "failed"
	PaymentStatusCancelled        PaymentStatus = "cancelled"
	PaymentStatusRefunded         PaymentStatus = "refunded"
	PaymentStatusPartiallyRefunded PaymentStatus = "partially_refunded"
)

type BookingSource string

const (
	BookingSourceWeb     BookingSource = "web"
	BookingSourceMobile  BookingSource = "mobile"
	BookingSourceAdmin   BookingSource = "admin"
	BookingSourcePartner BookingSource = "partner"
	BookingSourceWalkIn  BookingSource = "walk_in"
)

// GuestInfo represents information about a guest
type GuestInfo struct {
	Name                string      `json:"name" validate:"required,max=255"`
	Age                 *int        `json:"age,omitempty" validate:"omitempty,min=0,max=120"`
	AgeCategory         AgeCategory `json:"ageCategory"`
	TicketType          TicketType  `json:"ticketType"`
	SpecialRequirements StringArray `json:"specialRequirements" gorm:"type:text[]"`
}

// BookingItem represents an individual ticket in a booking
type BookingItem struct {
	ID                   uuid.UUID `json:"id"`
	GuestInfo           GuestInfo `json:"guestInfo" gorm:"type:jsonb"`
	BasePrice           float64   `json:"basePrice" validate:"min=0"`
	DiscountAmount      float64   `json:"discountAmount" validate:"min=0"`
	FinalPrice          float64   `json:"finalPrice" validate:"min=0"`
	LoyaltyPointsUsed   int       `json:"loyaltyPointsUsed" validate:"min=0"`
	LoyaltyPointsEarned int       `json:"loyaltyPointsEarned" validate:"min=0"`
}

// DiscountInfo represents discount information
type DiscountInfo struct {
	Type        string      `json:"type" validate:"oneof=percentage fixed loyalty promo"`
	Code        *string     `json:"code,omitempty"`
	Description string      `json:"description" validate:"max=500"`
	Amount      float64     `json:"amount" validate:"min=0"`
	AppliedTo   []uuid.UUID `json:"appliedTo" gorm:"type:uuid[]"`
	MaxUsage    *int        `json:"maxUsage,omitempty" validate:"omitempty,min=1"`
	UsageCount  int         `json:"usageCount" validate:"min=0"`
}

// ContactInfo represents contact information
type ContactInfo struct {
	FirstName        string  `json:"firstName" validate:"required,max=100"`
	LastName         string  `json:"lastName" validate:"required,max=100"`
	PhoneNumber      string  `json:"phoneNumber" validate:"required,e164"`
	Email            *string `json:"email,omitempty" validate:"omitempty,email"`
	EmergencyContact *string `json:"emergencyContact,omitempty" validate:"omitempty,e164"`
}

// Booking represents a booking/reservation
type Booking struct {
	BaseModel
	UserID        uuid.UUID     `json:"userId" gorm:"not null"`
	ParkID        uuid.UUID     `json:"parkId" gorm:"not null"`
	Status        BookingStatus `json:"status" gorm:"default:draft"`
	PaymentStatus PaymentStatus `json:"paymentStatus" gorm:"default:pending"`
	Source        BookingSource `json:"source" gorm:"default:web"`
	
	// Booking details
	VisitDate   time.Time `json:"visitDate"`
	TimeSlot    *string   `json:"timeSlot,omitempty"`
	Duration    int       `json:"duration" gorm:"default:180"` // minutes
	
	// Tickets
	Items       []BookingItem `json:"items" gorm:"type:jsonb"`
	TotalGuests int           `json:"totalGuests" validate:"min=1"`
	
	// Pricing
	Subtotal       float64 `json:"subtotal" validate:"min=0"`
	DiscountAmount float64 `json:"discountAmount" validate:"min=0"`
	TaxAmount      float64 `json:"taxAmount" validate:"min=0"`
	TotalAmount    float64 `json:"totalAmount" validate:"min=0"`
	Currency       string  `json:"currency" gorm:"default:KGS"`
	
	// Discounts and loyalty
	Discounts           []DiscountInfo `json:"discounts" gorm:"type:jsonb"`
	LoyaltyPointsUsed   int            `json:"loyaltyPointsUsed" validate:"min=0"`
	LoyaltyPointsEarned int            `json:"loyaltyPointsEarned" validate:"min=0"`
	PromoCode           *string        `json:"promoCode,omitempty"`
	
	// Contact information
	ContactInfo ContactInfo `json:"contactInfo" gorm:"type:jsonb"`
	
	// Special requirements
	SpecialRequirements StringArray `json:"specialRequirements" gorm:"type:text[]"`
	Notes               *string     `json:"notes,omitempty" validate:"omitempty,max=1000"`
	StaffNotes          *string     `json:"staffNotes,omitempty" validate:"omitempty,max=1000"`
	
	// Timestamps and tracking
	BookedAt    time.Time  `json:"bookedAt"`
	ConfirmedAt *time.Time `json:"confirmedAt,omitempty"`
	CheckedInAt *time.Time `json:"checkedInAt,omitempty"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	CancelledAt *time.Time `json:"cancelledAt,omitempty"`
	RefundedAt  *time.Time `json:"refundedAt,omitempty"`
	
	// Cancellation info
	CancellationReason *string    `json:"cancellationReason,omitempty" validate:"omitempty,max=500"`
	CancelledBy        *uuid.UUID `json:"cancelledBy,omitempty"`
	RefundAmount       *float64   `json:"refundAmount,omitempty" validate:"omitempty,min=0"`
	RefundReason       *string    `json:"refundReason,omitempty" validate:"omitempty,max=500"`
	
	// System fields
	Metadata JSONB `json:"metadata" gorm:"type:jsonb"`
	
	// Relationships
	User     *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Park     *Park     `json:"park,omitempty" gorm:"foreignKey:ParkID"`
	Tickets  []Ticket  `json:"tickets,omitempty" gorm:"foreignKey:BookingID"`
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:BookingID"`
}

// ====================================
// PAYMENT TYPES
// ====================================

type PaymentMethod string

const (
	PaymentMethodELQR          PaymentMethod = "elqr"
	PaymentMethodElcart        PaymentMethod = "elcart"
	PaymentMethodMBank         PaymentMethod = "mbank"
	PaymentMethodODengi        PaymentMethod = "odengi"
	PaymentMethodBankCard      PaymentMethod = "bank_card"
	PaymentMethodCash          PaymentMethod = "cash"
	PaymentMethodLoyaltyPoints PaymentMethod = "loyalty_points"
	PaymentMethodWallet        PaymentMethod = "wallet"
)

type PaymentProvider string

const (
	PaymentProviderELQR       PaymentProvider = "elqr"
	PaymentProviderElcart     PaymentProvider = "elcart"
	PaymentProviderMBank      PaymentProvider = "mbank"
	PaymentProviderODengi     PaymentProvider = "odengi"
	PaymentProviderVisa       PaymentProvider = "visa"
	PaymentProviderMastercard PaymentProvider = "mastercard"
	PaymentProviderInternal   PaymentProvider = "internal"
)

type RefundReason string

const (
	RefundReasonUserRequest      RefundReason = "user_request"
	RefundReasonBookingCancelled RefundReason = "booking_cancelled"
	RefundReasonParkClosure      RefundReason = "park_closure"
	RefundReasonTechnicalIssue   RefundReason = "technical_issue"
	RefundReasonOverbooking      RefundReason = "overbooking"
	RefundReasonAdminAction      RefundReason = "admin_action"
)

// PaymentCard represents payment card information
type PaymentCard struct {
	Last4       string `json:"last4"`
	Brand       string `json:"brand"`
	ExpiryMonth int    `json:"expiryMonth"`
	ExpiryYear  int    `json:"expiryYear"`
	HolderName  *string `json:"holderName,omitempty"`
}

// PaymentDetails represents provider-specific payment details
type PaymentDetails struct {
	Provider              PaymentProvider `json:"provider"`
	ProviderTransactionID *string         `json:"providerTransactionId,omitempty"`
	ProviderReference     *string         `json:"providerReference,omitempty"`
	Card                  *PaymentCard    `json:"card,omitempty"`
	PhoneNumber           *string         `json:"phoneNumber,omitempty"`
	WalletID              *string         `json:"walletId,omitempty"`
	Metadata              JSONB           `json:"metadata" gorm:"type:jsonb"`
}

// RefundDetails represents refund information
type RefundDetails struct {
	ID              uuid.UUID    `json:"id"`
	Amount          float64      `json:"amount" validate:"min=0"`
	Reason          RefundReason `json:"reason"`
	Description     *string      `json:"description,omitempty" validate:"omitempty,max=500"`
	RequestedBy     uuid.UUID    `json:"requestedBy"`
	ProcessedBy     *uuid.UUID   `json:"processedBy,omitempty"`
	RequestedAt     time.Time    `json:"requestedAt"`
	ProcessedAt     *time.Time   `json:"processedAt,omitempty"`
	ProviderRefundID *string     `json:"providerRefundId,omitempty"`
	Status          string       `json:"status" validate:"oneof=pending processing completed failed"`
	Metadata        JSONB        `json:"metadata" gorm:"type:jsonb"`
}

// Payment represents a payment transaction
type Payment struct {
	BaseModel
	BookingID uuid.UUID     `json:"bookingId" gorm:"not null"`
	UserID    uuid.UUID     `json:"userId" gorm:"not null"`
	
	// Payment details
	Method PaymentMethod `json:"method" gorm:"not null"`
	Status PaymentStatus `json:"status" gorm:"default:pending"`
	
	// Amounts (in KGS)
	Amount         float64 `json:"amount" validate:"min=0"`
	OriginalAmount float64 `json:"originalAmount" validate:"min=0"`
	FeeAmount      float64 `json:"feeAmount" validate:"min=0"`
	NetAmount      float64 `json:"netAmount" validate:"min=0"`
	Currency       string  `json:"currency" gorm:"default:KGS"`
	
	// Exchange rate info (if applicable)
	ExchangeRate     *float64 `json:"exchangeRate,omitempty"`
	OriginalCurrency *string  `json:"originalCurrency,omitempty"`
	
	// Provider details
	Details PaymentDetails `json:"details" gorm:"type:jsonb"`
	
	// Refunds
	Refunds       []RefundDetails `json:"refunds" gorm:"type:jsonb"`
	TotalRefunded float64         `json:"totalRefunded" validate:"min=0"`
	
	// Timestamps
	InitiatedAt *time.Time `json:"initiatedAt,omitempty"`
	AuthorizedAt *time.Time `json:"authorizedAt,omitempty"`
	CapturedAt  *time.Time `json:"capturedAt,omitempty"`
	FailedAt    *time.Time `json:"failedAt,omitempty"`
	ExpiredAt   *time.Time `json:"expiredAt,omitempty"`
	
	// Additional info
	Description   *string `json:"description,omitempty" validate:"omitempty,max=500"`
	FailureReason *string `json:"failureReason,omitempty" validate:"omitempty,max=500"`
	IPAddress     *string `json:"ipAddress,omitempty"`
	UserAgent     *string `json:"userAgent,omitempty"`
	
	// System fields
	Metadata JSONB `json:"metadata" gorm:"type:jsonb"`
	
	// Relationships
	Booking *Booking `json:"booking,omitempty" gorm:"foreignKey:BookingID"`
	User    *User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// API Response types
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     *APIError   `json:"error,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
	RequestID *string     `json:"requestId,omitempty"`
	Version   string      `json:"version"`
}

type APIError struct {
	Type      string    `json:"type"`
	Code      string    `json:"code"`
	Message   string    `json:"message"`
	Details   *string   `json:"details,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

type PaginationInfo struct {
	Page         int  `json:"page"`
	Limit        int  `json:"limit"`
	Total        int  `json:"total"`
	TotalPages   int  `json:"totalPages"`
	HasNextPage  bool `json:"hasNextPage"`
	HasPrevPage  bool `json:"hasPreviousPage"`
}

type PaginatedResponse struct {
	Success    bool           `json:"success"`
	Data       interface{}    `json:"data"`
	Pagination PaginationInfo `json:"pagination"`
	Timestamp  time.Time      `json:"timestamp"`
	RequestID  *string        `json:"requestId,omitempty"`
	Version    string         `json:"version"`
}

func GenerateUUID() uuid.UUID {
	return uuid.New()
} 