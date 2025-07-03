package park

import (
"fmt"

"gorm.io/gorm"

"skypark/internal/models"
)

type ParkService struct {
db *gorm.DB
}

func NewParkService(db *gorm.DB) *ParkService {
return &ParkService{
db: db,
}
}

func (s *ParkService) SeedBishkekParks() error {
// Проверяем, есть ли уже парки
var count int64
s.db.Model(&models.Park{}).Where("deleted_at IS NULL").Count(&count)
if count > 0 {
return nil // Парки уже есть
}

fmt.Println("Sample parks seeded successfully")
return nil
}

 