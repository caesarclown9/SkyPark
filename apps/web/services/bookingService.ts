import { API_BASE_URL } from '@/lib/utils';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface BookingRequest {
  park_id: string;
  booking_date: string;
  time_slot: string;
  adult_count: number;
  child_count: number;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  special_requests?: string;
  age_groups?: string[];
  preferred_language?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  park_id: string;
  booking_date: string;
  time_slot: string;
  adult_count: number;
  child_count: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  special_requests?: string;
  age_groups?: string[];
  preferred_language?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  park?: {
    id: string;
    name: string;
    address: any;
    phone_number?: string;
  };
}

export interface TimeSlot {
  time_slot: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface TimeSlotResponse {
  park_id: string;
  date: string;
  time_slots: TimeSlot[];
}

export interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  bookings_by_status: Record<string, number>;
  revenue_today: number;
  revenue_this_month: number;
  popular_time_slots: Array<{
    time_slot: string;
    count: number;
  }>;
  popular_parks: Array<{
    park_id: string;
    park_name: string;
    count: number;
  }>;
}

class BookingService {
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('access_token');
    
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  async getAvailableTimeSlots(parkId: string, date: string): Promise<TimeSlotResponse> {
    if (DEMO_MODE) {
      // В demo режиме возвращаем mock данные
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        park_id: parkId,
        date: date,
        time_slots: [
          { time_slot: '10:00-12:00', start_time: '10:00', end_time: '12:00', available: true },
          { time_slot: '12:00-14:00', start_time: '12:00', end_time: '14:00', available: true },
          { time_slot: '14:00-16:00', start_time: '14:00', end_time: '16:00', available: false },
          { time_slot: '16:00-18:00', start_time: '16:00', end_time: '18:00', available: true },
          { time_slot: '18:00-20:00', start_time: '18:00', end_time: '20:00', available: true },
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/bookings/parks/${parkId}/time-slots?date=${date}`);
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить временные слоты');
    }
    
    const data = await response.json();
    return data.data;
  }

  async createBooking(booking: BookingRequest): Promise<Booking> {
    if (DEMO_MODE) {
      // В demo режиме создаем mock бронирование
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBooking: Booking = {
        id: 'booking-' + Date.now(),
        user_id: 'demo-user-001',
        park_id: booking.park_id,
        booking_date: booking.booking_date,
        time_slot: booking.time_slot,
        adult_count: booking.adult_count,
        child_count: booking.child_count,
        total_cost: this.calculateTotalCost(booking.adult_count, booking.child_count, 350),
        status: 'confirmed',
        contact_name: booking.contact_name,
        contact_phone: booking.contact_phone,
        contact_email: booking.contact_email,
        special_requests: booking.special_requests,
        age_groups: booking.age_groups,
        preferred_language: booking.preferred_language,
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mockBooking;
    }

    const response = await this.fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось создать бронирование');
    }

    const data = await response.json();
    return data.data;
  }

  async getUserBookings(filters?: {
    status?: string;
    from_date?: string;
    to_date?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; total: number }> {
    if (DEMO_MODE) {
      // В demo режиме возвращаем mock бронирования
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockBookings: Booking[] = [
        {
          id: 'booking-001',
          user_id: 'demo-user-001',
          park_id: 'park-001',
          booking_date: '2025-01-03',
          time_slot: '14:00-16:00',
          adult_count: 2,
          child_count: 1,
          total_cost: 800,
          status: 'confirmed',
          contact_name: 'Айгуль Мамбетова',
          contact_phone: '+996700123456',
          contact_email: 'aigul@example.com',
          special_requests: 'День рождения ребенка',
          confirmed_at: '2025-01-02T10:30:00Z',
          created_at: '2025-01-02T10:00:00Z',
          updated_at: '2025-01-02T10:30:00Z',
          park: {
            id: 'park-001',
            name: 'Sky Park Центр',
            address: 'ул. Чуй, 123, Бишкек',
            phone_number: '+996 (312) 123-456'
          }
        },
        {
          id: 'booking-002',
          user_id: 'demo-user-001',
          park_id: 'park-003',
          booking_date: '2024-12-28',
          time_slot: '10:00-12:00',
          adult_count: 1,
          child_count: 2,
          total_cost: 950,
          status: 'completed',
          contact_name: 'Айгуль Мамбетова',
          contact_phone: '+996700123456',
          contact_email: 'aigul@example.com',
          created_at: '2024-12-27T15:00:00Z',
          updated_at: '2024-12-28T12:00:00Z',
          park: {
            id: 'park-003',
            name: 'Sky Park Запад',
            address: 'ул. Ахунбаева, 45, Бишкек',
            phone_number: '+996 (312) 345-678'
          }
        }
      ];
      
      return {
        bookings: mockBookings,
        total: mockBookings.length
      };
    }

    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    const query = params.toString();
    const url = `/bookings${query ? `?${query}` : ''}`;
    
    const response = await this.fetchWithAuth(url);

    if (!response.ok) {
      throw new Error('Не удалось загрузить бронирования');
    }

    const data = await response.json();
    return {
      bookings: data.data,
      total: data.total,
    };
  }

  async getBookingById(id: string): Promise<Booking> {
    const response = await this.fetchWithAuth(`/bookings/${id}`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить бронирование');
    }

    const data = await response.json();
    return data.data;
  }

  async updateBooking(id: string, updates: Partial<BookingRequest>): Promise<Booking> {
    const response = await this.fetchWithAuth(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось обновить бронирование');
    }

    const data = await response.json();
    return data.data;
  }

  async cancelBooking(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось отменить бронирование');
    }
  }

  // Admin methods
  async getBookingStats(): Promise<BookingStats> {
    const response = await this.fetchWithAuth('/api/v1/admin/bookings/stats');

    if (!response.ok) {
      throw new Error('Не удалось загрузить статистику');
    }

    const data = await response.json();
    return data.data;
  }

  async getAllBookings(): Promise<{ bookings: Booking[]; total: number }> {
    const response = await this.fetchWithAuth('/api/v1/admin/bookings');

    if (!response.ok) {
      throw new Error('Не удалось загрузить все бронирования');
    }

    const data = await response.json();
    return {
      bookings: data.data,
      total: data.total,
    };
  }

  async confirmBooking(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/admin/bookings/${id}/confirm`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось подтвердить бронирование');
    }
  }

  async completeBooking(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/admin/bookings/${id}/complete`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось завершить бронирование');
    }
  }

  async rejectBooking(id: string, reason: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/admin/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Не удалось отклонить бронирование');
    }
  }

  // Helper methods
  formatBookingStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено',
      rejected: 'Отклонено',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-green-600 bg-green-50 border-green-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  }

  calculateTotalCost(adultCount: number, childCount: number, basePrice: number = 150): number {
    // Простой расчет: взрослые полная цена, дети 50% скидка
    return (adultCount * basePrice) + (childCount * basePrice * 0.5);
  }

  isBookingModifiable(booking: Booking): boolean {
    if (booking.status !== 'pending') return false;
    
    const bookingDate = new Date(booking.booking_date);
    const now = new Date();
    const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return diffHours > 24; // Можно редактировать только за 24 часа до посещения
  }

  isBookingCancellable(booking: Booking): boolean {
    if (booking.status === 'cancelled' || booking.status === 'completed') return false;
    
    const bookingDate = new Date(booking.booking_date);
    const now = new Date();
    
    return bookingDate > now; // Можно отменить до даты посещения
  }

  formatTimeSlot(timeSlot: string): string {
    return timeSlot.replace('-', ' - ');
  }

  parseTimeSlot(timeSlot: string): { start: string; end: string } {
    const [start, end] = timeSlot.split('-');
    return { start: start.trim(), end: end.trim() };
  }
}

export const bookingService = new BookingService(); 
 