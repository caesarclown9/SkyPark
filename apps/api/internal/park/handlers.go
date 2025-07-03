package park

import (
"net/http"

"github.com/gin-gonic/gin"
"gorm.io/gorm"

"skypark/internal/models"
)

type ParkHandlers struct {
db *gorm.DB
}

func NewParkHandlers(db *gorm.DB) *ParkHandlers {
return &ParkHandlers{
db: db,
}
}

func (h *ParkHandlers) GetParks(c *gin.Context) {
var parks []models.Park
if err := h.db.Where("deleted_at IS NULL").Find(&parks).Error; err != nil {
c.JSON(http.StatusInternalServerError, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "DATABASE_ERROR",
"message": "Failed to fetch parks",
},
})
return
}

c.JSON(http.StatusOK, gin.H{
"success": true,
"data":    parks,
"total":   len(parks),
})
}

func (h *ParkHandlers) GetParkByID(c *gin.Context) {
parkID := c.Param("id")
var park models.Park

if err := h.db.Where("id = ? AND deleted_at IS NULL", parkID).First(&park).Error; err != nil {
if err == gorm.ErrRecordNotFound {
c.JSON(http.StatusNotFound, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "PARK_NOT_FOUND",
"message": "Park not found",
},
})
return
}

c.JSON(http.StatusInternalServerError, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "DATABASE_ERROR",
"message": "Failed to fetch park",
},
})
return
}

c.JSON(http.StatusOK, gin.H{
"success": true,
"data":    park,
})
}

func (h *ParkHandlers) GetNearbyParks(c *gin.Context) {
c.JSON(http.StatusNotImplemented, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "NOT_IMPLEMENTED",
"message": "Nearby parks not implemented yet",
},
})
}

func (h *ParkHandlers) CreatePark(c *gin.Context) {
c.JSON(http.StatusNotImplemented, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "NOT_IMPLEMENTED",
"message": "Create park not implemented yet",
},
})
}

func (h *ParkHandlers) UpdatePark(c *gin.Context) {
c.JSON(http.StatusNotImplemented, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "NOT_IMPLEMENTED",
"message": "Update park not implemented yet",
},
})
}

func (h *ParkHandlers) DeletePark(c *gin.Context) {
c.JSON(http.StatusNotImplemented, gin.H{
"success": false,
"error": map[string]interface{}{
"code":    "NOT_IMPLEMENTED",
"message": "Delete park not implemented yet",
},
})
}

func (h *ParkHandlers) GetBishkekDistricts(c *gin.Context) {
districts := []map[string]interface{}{
{
"name":        "Свердловский",
"name_ru":     "Свердловский район",
"name_ky":     "Свердлов району",
"center_lat":  42.8746,
"center_lon":  74.5698,
"description": "Центральный район с основными достопримечательностями",
},
{
"name":        "Первомайский",
"name_ru":     "Первомайский район", 
"name_ky":     "Биринчи май району",
"center_lat":  42.8400,
"center_lon":  74.6200,
"description": "Южный район города",
},
}

c.JSON(http.StatusOK, gin.H{
"success": true,
"data":    districts,
"total":   len(districts),
})
}
