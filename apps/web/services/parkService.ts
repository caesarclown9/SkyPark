import type { 
  Park, 
  APIResponse,
  PaginatedResponse 
} from '@skypark/shared/types';

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

// Mock mode для демонстрации
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_API_URL;

class ParkService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API Error');
    }

    return response.json();
  }

  /**
   * Получить список парков с фильтрацией и пагинацией
   */
  async getParks(filters: ParkFilters = {}): Promise<PaginatedResponse<Park[]>> {
    if (DEMO_MODE) {
      const { mockParkService } = await import('./parkService.mock');
      return mockParkService.getParks(filters);
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await this.request<Park[]>(
      `/api/v1/parks?${params.toString()}`
    );

    return {
      ...response,
      pagination: (response as any).pagination,
    } as PaginatedResponse<Park[]>;
  }

  /**
   * Получить парк по ID
   */
  async getParkById(id: string): Promise<APIResponse<Park>> {
    if (DEMO_MODE) {
      const { mockParkService } = await import('./parkService.mock');
      return mockParkService.getParkById(id);
    }

    return this.request<Park>(`/api/v1/parks/${id}`);
  }

  /**
   * Поиск парков рядом с координатами
   */
  async getNearbyParks(
    lat: number,
    lon: number,
    radius = 10
  ): Promise<APIResponse<Park[]>> {
    if (DEMO_MODE) {
      const { mockParkService } = await import('./parkService.mock');
      return mockParkService.getNearbyParks(lat, lon, radius);
    }

    return this.request<Park[]>(
      `/api/v1/parks/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
    );
  }

  /**
   * Получить список районов Бишкека
   */
  async getBishkekDistricts(): Promise<APIResponse<BishkekDistrict[]>> {
    if (DEMO_MODE) {
      const { mockParkService } = await import('./parkService.mock');
      return mockParkService.getBishkekDistricts();
    }

    return this.request<BishkekDistrict[]>('/api/v1/parks/districts');
  }

  /**
   * Получить статистику по паркам (для админов)
   */
  async getParkStats(): Promise<APIResponse<ParkStats>> {
    return this.request<ParkStats>('/api/v1/admin/parks/stats');
  }

  /**
   * Создать новый парк (только админы)
   */
  async createPark(parkData: Partial<Park>): Promise<APIResponse<Park>> {
    return this.request<Park>('/api/v1/admin/parks', {
      method: 'POST',
      body: JSON.stringify(parkData),
    });
  }

  /**
   * Обновить парк (только админы)
   */
  async updatePark(
    id: string,
    updates: Partial<Park>
  ): Promise<APIResponse<Park>> {
    return this.request<Park>(`/api/v1/admin/parks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Удалить парк (только админы)
   */
  async deletePark(id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/api/v1/admin/parks/${id}`, {
      method: 'DELETE',
    });
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
          // Если геолокация не доступна, возвращаем центр Бишкека
          console.warn('Geolocation error:', error);
          resolve({
            lat: 42.8746, // Центр Бишкека
            lon: 74.5698,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 минут
        }
      );
    });
  }

  /**
   * Вычислить расстояние между двумя точками в км
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Радиус Земли в км
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
    if (!park.opening_hours) {
      return true; // Если расписание не задано, считаем что открыт
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Получаем день недели
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[now.getDay()];
    
    // Получаем часы работы для текущего дня
    const dayHours = park.opening_hours[dayName];
    
    if (!dayHours || typeof dayHours !== 'object') {
      return true; // Если для дня нет расписания, считаем что открыт
    }
    
    const openingTime = dayHours.open;
    const closingTime = dayHours.close;
    
    // Проверяем, что время задано
    if (!openingTime || !closingTime) {
      return true; // Если время не задано, считаем что открыт
    }
    
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    // Если работает через полночь
    if (closeMinutes < openMinutes) {
      return currentTime >= openMinutes || currentTime <= closeMinutes;
    }
    
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  }

  /**
   * Форматировать часы работы для отображения
   */
  formatWorkingHours(park: Park): string {
    if (!park.opening_hours) {
      return 'Круглосуточно';
    }

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[now.getDay()];
    
    const dayHours = park.opening_hours[dayName];
    
    if (!dayHours || typeof dayHours !== 'object') {
      return 'Круглосуточно';
    }
    
    const openingTime = dayHours.open;
    const closingTime = dayHours.close;
    
    // Проверяем, что рабочие часы заданы
    if (!openingTime || !closingTime) {
      return 'Круглосуточно';
    }
    
    return `${openingTime} - ${closingTime}`;
  }

  /**
   * Получить рекомендованные парки для пользователя
   */
  async getRecommendedParks(limit = 6): Promise<APIResponse<Park[]>> {
    if (DEMO_MODE) {
      const { mockParkService } = await import('./parkService.mock');
      return mockParkService.getRecommendedParks(limit);
    }

    try {
      // Пытаемся получить геолокацию для персонализации
      const location = await this.getCurrentLocation();
      
      // Получаем ближайшие парки с высоким рейтингом
      const response = await this.request<Park[]>(
        `/api/v1/parks?lat=${location.lat}&lon=${location.lon}&sort=rating&order=desc&limit=${limit}`
      );
      
      return response;
    } catch (error) {
      // Fallback - просто лучшие парки по рейтингу
      return this.request<Park[]>(
        `/api/v1/parks?sort=rating&order=desc&limit=${limit}`
      );
    }
  }
}

export const parkService = new ParkService();
export type { ParkFilters, BishkekDistrict, ParkStats }; 
 