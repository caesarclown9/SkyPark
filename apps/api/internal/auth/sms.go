package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"regexp"
	"time"
)

type SMSCode struct {
	Phone     string    `json:"phone"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	Attempts  int       `json:"attempts"`
	CreatedAt time.Time `json:"created_at"`
}

type SMSService struct {
	codes    map[string]*SMSCode // В продакшене использовать Redis
	codeTTL  time.Duration
	codeLen  int
	maxAttempts int
}

func NewSMSService() *SMSService {
	return &SMSService{
		codes:       make(map[string]*SMSCode),
		codeTTL:     5 * time.Minute, // Код действует 5 минут
		codeLen:     6,               // 6-значный код
		maxAttempts: 3,               // Максимум 3 попытки
	}
}

// ValidateKyrgyzstanPhone проверяет формат номера телефона Кыргызстана
func (s *SMSService) ValidateKyrgyzstanPhone(phone string) bool {
	// Кыргызстан: +996XXXXXXXXX (9 цифр после +996)
	// Поддерживаемые операторы: Beeline (+996770-779, +996220-229), 
	// MegaCom (+996550-559), O! (+996500-509), NurTelecom (+996990-999)
	patterns := []string{
		`^\+996[57][0-9]{8}$`,  // Основные мобильные операторы
		`^\+9962[0-9]{8}$`,     // Стационарные в Бишкеке
		`^\+996[0-9]{9}$`,      // Общий формат для всех номеров
	}

	for _, pattern := range patterns {
		matched, _ := regexp.MatchString(pattern, phone)
		if matched {
			return true
		}
	}
	return false
}

// GenerateCode создает случайный 6-значный код
func (s *SMSService) GenerateCode() string {
	code := ""
	for i := 0; i < s.codeLen; i++ {
		num, _ := rand.Int(rand.Reader, big.NewInt(10))
		code += num.String()
	}
	return code
}

// SendVerificationCode отправляет код подтверждения
func (s *SMSService) SendVerificationCode(phone string) (*SMSCode, error) {
	if !s.ValidateKyrgyzstanPhone(phone) {
		return nil, fmt.Errorf("invalid phone number format for Kyrgyzstan")
	}

	// Проверяем существующий код
	if existingCode, exists := s.codes[phone]; exists {
		// Если код еще не истек и не превышен лимит попыток
		if time.Now().Before(existingCode.ExpiresAt) && existingCode.Attempts < s.maxAttempts {
			return existingCode, nil
		}
		// Удаляем устаревший код
		delete(s.codes, phone)
	}

	// Генерируем новый код
	code := s.GenerateCode()
	smsCode := &SMSCode{
		Phone:     phone,
		Code:      code,
		ExpiresAt: time.Now().Add(s.codeTTL),
		Attempts:  0,
		CreatedAt: time.Now(),
	}

	// Сохраняем код
	s.codes[phone] = smsCode

	// В продакшене здесь будет интеграция с SMS-провайдером Кыргызстана
	// Например: Beeline KG, MegaCom, O! или другие локальные провайдеры
	fmt.Printf("📱 SMS to %s: Your Sky Park verification code is: %s\n", phone, code)
	fmt.Printf("🕒 Code expires at: %s\n", smsCode.ExpiresAt.Format("15:04:05"))

	return smsCode, nil
}

// VerifyCode проверяет введенный код
func (s *SMSService) VerifyCode(phone, inputCode string) (bool, error) {
	smsCode, exists := s.codes[phone]
	if !exists {
		return false, fmt.Errorf("no verification code found for this phone number")
	}

	// Проверяем истечение срока
	if time.Now().After(smsCode.ExpiresAt) {
		delete(s.codes, phone)
		return false, fmt.Errorf("verification code has expired")
	}

	// Увеличиваем счетчик попыток
	smsCode.Attempts++

	// Проверяем лимит попыток
	if smsCode.Attempts > s.maxAttempts {
		delete(s.codes, phone)
		return false, fmt.Errorf("maximum verification attempts exceeded")
	}

	// Проверяем код
	if smsCode.Code != inputCode {
		return false, fmt.Errorf("invalid verification code")
	}

	// Код верный, удаляем его
	delete(s.codes, phone)
	return true, nil
}

// CleanupExpiredCodes очищает истекшие коды (вызывается периодически)
func (s *SMSService) CleanupExpiredCodes() {
	now := time.Now()
	for phone, code := range s.codes {
		if now.After(code.ExpiresAt) {
			delete(s.codes, phone)
		}
	}
}

// GetRemainingAttempts возвращает оставшееся количество попыток
func (s *SMSService) GetRemainingAttempts(phone string) int {
	if code, exists := s.codes[phone]; exists {
		return s.maxAttempts - code.Attempts
	}
	return s.maxAttempts
} 
 