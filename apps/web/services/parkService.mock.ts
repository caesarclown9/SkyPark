import type { 
  Park, 
  APIResponse,
  PaginatedResponse 
} from '@skypark/shared/types';
import { mockParks, mockDistricts, mockDelay, searchParks, filterByDistrict, sortParks } from '../lib/mock';

interface ParkFilters {
  district?: string;
  status?: string;
  amenity?: string;
  search?: string;
  lat?: number;
  lon?: number;
  radius?: number;
  sort?: 'name' | 'rating' | 'created_at';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
}

interface BishkekDistrict {
  name: string;
  name_ru: string;
  name_ky: string;
  center_lat: number;
  center_lon: number;
  description: string;
}

interface ParkStats {
  total_parks: number;
  active_parks: number;
  parks_per_district: Record<string, number>;
  average_rating: number;
  popular_amenities: Array<{
    amenity: string;
    count: number;
    percentage: number;
  }>;
}

class MockParkService {
  /**
   * Получить список парков с фильтрацией и пагинацией
   */
  async getParks(filters: ParkFilters = {}): Promise<PaginatedResponse<Park[]>> {
    await mockDelay(150);

    let filteredParks = [...mockParks];

    // Применяем фильтры
    if (filters.search) {
      filteredParks = searchParks(filteredParks, filters.search);
    }

    if (filters.district) {
      filteredParks = filterByDistrict(filteredParks, filters.district);
    }

    if (filters.status) {
      filteredParks = filteredParks.filter(park => park.status === filters.status);
    }

    if (filters.amenity) {
      filteredParks = filteredParks.filter(park => 
        park.amenities.includes(filters.amenity!)
      );
    }

    if (filters.featured) {
      // Возвращаем топ парки по рейтингу
      filteredParks = filteredParks
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
    }

    // Сортировка
    if (filters.sort) {
      filteredParks = sortParks(filteredParks, filters.sort, filters.order || 'asc');
    }

    // Пагинация
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedParks = filteredParks.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedParks,
      pagination: {
        page,
        limit,
        total: filteredParks.length,
        total_pages: Math.ceil(filteredParks.length / limit)
      }
    };
  }

  /**
   * Получить парк по ID
   */
  async getParkById(id: string): Promise<APIResponse<Park>> {
    await mockDelay(200);

    const park = mockParks.find(p => p.id === id);
    
    if (!park) {
      throw new Error('Парк не найден');
    }

    return {
      success: true,
      data: park
    };
  }

  /**
   * Поиск парков рядом с координатами
   */
  async getNearbyParks(
    lat: number,
    lon: number,
    radius = 10
  ): Promise<APIResponse<Park[]>> {
    await mockDelay(200);

    const nearbyParks = mockParks.filter(park => {
      const distance = this.calculateDistance(lat, lon, park.latitude, park.longitude);
      return distance <= radius;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(lat, lon, a.latitude, a.longitude);
      const distanceB = this.calculateDistance(lat, lon, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    return {
      success: true,
      data: nearbyParks
    };
  }

  /**
   * Получить список районов Бишкека
   */
  async getBishkekDistricts(): Promise<APIResponse<BishkekDistrict[]>> {
    await mockDelay(100);

    return {
      success: true,
      data: mockDistricts
    };
  }

  /**
   * Получить статистику по паркам
   */
  async getParkStats(): Promise<APIResponse<ParkStats>> {
    await mockDelay(100);

    const stats: ParkStats = {
      total_parks: mockParks.length,
      active_parks: mockParks.filter(p => p.status === 'active').length,
      parks_per_district: {},
      average_rating: mockParks.reduce((sum, park) => sum + park.rating, 0) / mockParks.length,
      popular_amenities: []
    };

    // Подсчитываем парки по районам
    mockDistricts.forEach(district => {
      const parksInDistrict = filterByDistrict(mockParks, district.name);
      stats.parks_per_district[district.name_ru] = parksInDistrict.length;
    });

    // Подсчитываем популярные удобства
    const amenityCount: Record<string, number> = {};
    mockParks.forEach(park => {
      park.amenities.forEach(amenity => {
        amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
      });
    });

    stats.popular_amenities = Object.entries(amenityCount)
      .map(([amenity, count]) => ({
        amenity,
        count,
        percentage: Math.round((count / mockParks.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Получить текущую геолокацию пользователя
   */
  getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation не поддерживается браузером'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Возвращаем центр Бишкека
          resolve({
            lat: 42.8746,
            lon: 74.5698,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    });
  }

  /**
   * Вычислить расстояние между двумя точками в км
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Проверить, открыт ли парк сейчас
   */
  isOpenNow(park: Park): boolean {
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = park.opening_hours[currentDay as keyof typeof park.opening_hours];
    if (!todayHours) return false;
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  }

  /**
   * Получить рекомендуемые парки
   */
  async getRecommendedParks(limit = 6): Promise<APIResponse<Park[]>> {
    await mockDelay(200);

    const recommended = mockParks
      .filter(park => park.status === 'active')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    return {
      success: true,
      data: recommended
    };
  }

  /**
   * Форматировать рабочие часы парка
   */
  formatWorkingHours(park: Park): string {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[today.getDay()];
    
    const todayHours = park.opening_hours[currentDay as keyof typeof park.opening_hours];
    
    if (!todayHours) {
      return 'Закрыто';
    }
    
    return `${todayHours.open} - ${todayHours.close}`;
  }
}

export const mockParkService = new MockParkService();
export type { ParkFilters, BishkekDistrict, ParkStats }; 