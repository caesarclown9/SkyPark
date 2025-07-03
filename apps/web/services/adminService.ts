import { API_BASE_URL } from '@/lib/utils';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff';
export type AdminPermission = 'parks_manage' | 'bookings_manage' | 'payments_view' | 'users_manage' | 'settings_manage' | 'reports_view';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  park_access?: string[]; // ID парков, к которым есть доступ
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  // Общая статистика
  total_revenue: number;
  total_bookings: number;
  total_visitors: number;
  active_parks: number;
  
  // За сегодня
  today_revenue: number;
  today_bookings: number;
  today_visitors: number;
  
  // Тренды (изменение по сравнению с прошлым периодом)
  revenue_trend: number; // % изменения
  bookings_trend: number;
  visitors_trend: number;
  
  // Топ парки
  top_parks: Array<{
    park_id: string;
    park_name: string;
    revenue: number;
    bookings: number;
    visitors: number;
  }>;
  
  // Популярные времена
  popular_time_slots: Array<{
    time_slot: string;
    bookings_count: number;
    revenue: number;
  }>;
  
  // Статистика платежей
  payment_methods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  data: Array<{
    date: string;
    revenue: number;
    bookings: number;
    visitors: number;
    average_ticket: number;
  }>;
  comparison: {
    previous_period_revenue: number;
    growth_percentage: number;
    best_day: {
      date: string;
      revenue: number;
    };
  };
}

export interface ParkStats {
  park_id: string;
  park_name: string;
  total_revenue: number;
  total_bookings: number;
  total_visitors: number;
  capacity_utilization: number; // %
  average_rating: number;
  
  // Временная статистика
  hourly_stats: Array<{
    hour: number;
    bookings: number;
    revenue: number;
    capacity_used: number;
  }>;
  
  // Недельная статистика
  weekly_stats: Array<{
    day_of_week: number;
    bookings: number;
    revenue: number;
    visitors: number;
  }>;
}

export interface BookingManagement {
  bookings: Array<{
    id: string;
    booking_number: string;
    park_name: string;
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    time_slot: string;
    adult_count: number;
    child_count: number;
    total_cost: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
  
  filters: {
    parks: Array<{ id: string; name: string }>;
    statuses: string[];
    date_range: {
      min_date: string;
      max_date: string;
    };
  };
}

export interface UserManagement {
  users: Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    loyalty_tier: string;
    loyalty_points: number;
    total_bookings: number;
    total_spent: number;
    last_visit?: string;
    registration_date: string;
    is_active: boolean;
  }>;
  
  stats: {
    total_users: number;
    active_users: number;
    new_users_this_month: number;
    loyalty_breakdown: Record<string, number>;
  };
}

class AdminService {
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  // Авторизация админа
  async adminLogin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Мок авторизация
    if (email === 'admin@skypark.kg' && password === 'admin123') {
      const adminUser: AdminUser = {
        id: 'admin-1',
        email: 'admin@skypark.kg',
        first_name: 'Админ',
        last_name: 'Системы',
        role: 'super_admin',
        permissions: ['parks_manage', 'bookings_manage', 'payments_view', 'users_manage', 'settings_manage', 'reports_view'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };
      
      const token = 'admin_token_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('admin_token', token);
      
      return { token, user: adminUser };
    }
    
    throw new Error('Неверные учетные данные');
  }

  // Получение статистики дашборда
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      total_revenue: 2847500,
      total_bookings: 1247,
      total_visitors: 3891,
      active_parks: 5,
      
      today_revenue: 45600,
      today_bookings: 23,
      today_visitors: 67,
      
      revenue_trend: 12.5,
      bookings_trend: 8.3,
      visitors_trend: 15.7,
      
      top_parks: [
        { park_id: 'park-1', park_name: 'Fantasy World', revenue: 785000, bookings: 342, visitors: 1023 },
        { park_id: 'park-2', park_name: 'Happy Land', revenue: 634000, bookings: 278, visitors: 856 },
        { park_id: 'park-3', park_name: 'Kids Zone', revenue: 523000, bookings: 231, visitors: 712 },
        { park_id: 'park-4', park_name: 'Wonder Park', revenue: 456000, bookings: 198, visitors: 634 },
        { park_id: 'park-5', park_name: 'Magic Castle', revenue: 449500, bookings: 198, visitors: 666 },
      ],
      
      popular_time_slots: [
        { time_slot: '10:00-12:00', bookings_count: 234, revenue: 456000 },
        { time_slot: '14:00-16:00', bookings_count: 198, revenue: 389000 },
        { time_slot: '16:00-18:00', bookings_count: 167, revenue: 334000 },
        { time_slot: '12:00-14:00', bookings_count: 145, revenue: 278000 },
      ],
      
      payment_methods: [
        { method: 'mBank', count: 456, amount: 1234000, percentage: 43.4 },
        { method: 'O!Деньги', count: 389, amount: 987000, percentage: 34.7 },
        { method: 'ЭлКарт', count: 234, amount: 456000, percentage: 16.0 },
        { method: 'Наличные', count: 168, amount: 170500, percentage: 5.9 },
      ],
    };
  }

  // Аналитика доходов
  async getRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Генерируем данные для последних 30 дней
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 20000,
        bookings: Math.floor(Math.random() * 30) + 10,
        visitors: Math.floor(Math.random() * 80) + 30,
        average_ticket: Math.floor(Math.random() * 200) + 250,
      });
    }
    
    return {
      period,
      data,
      comparison: {
        previous_period_revenue: 1856000,
        growth_percentage: 12.5,
        best_day: {
          date: '2025-01-28',
          revenue: 67890,
        },
      },
    };
  }

  // Статистика по паркам
  async getParkStats(parkId?: string): Promise<ParkStats[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (parkId) {
      return [{
        park_id: parkId,
        park_name: 'Fantasy World',
        total_revenue: 785000,
        total_bookings: 342,
        total_visitors: 1023,
        capacity_utilization: 67.5,
        average_rating: 4.7,
        
        hourly_stats: Array.from({ length: 12 }, (_, i) => ({
          hour: i + 8,
          bookings: Math.floor(Math.random() * 15) + 5,
          revenue: Math.floor(Math.random() * 25000) + 15000,
          capacity_used: Math.floor(Math.random() * 40) + 30,
        })),
        
        weekly_stats: Array.from({ length: 7 }, (_, i) => ({
          day_of_week: i,
          bookings: Math.floor(Math.random() * 25) + 15,
          revenue: Math.floor(Math.random() * 35000) + 25000,
          visitors: Math.floor(Math.random() * 70) + 40,
        })),
      }];
    }
    
    // Статистика по всем паркам
    return [
      { park_id: 'park-1', park_name: 'Fantasy World', total_revenue: 785000, total_bookings: 342, total_visitors: 1023, capacity_utilization: 67.5, average_rating: 4.7 },
      { park_id: 'park-2', park_name: 'Happy Land', total_revenue: 634000, total_bookings: 278, total_visitors: 856, capacity_utilization: 54.3, average_rating: 4.5 },
      { park_id: 'park-3', park_name: 'Kids Zone', total_revenue: 523000, total_bookings: 231, total_visitors: 712, capacity_utilization: 48.9, average_rating: 4.6 },
      { park_id: 'park-4', park_name: 'Wonder Park', total_revenue: 456000, total_bookings: 198, total_visitors: 634, capacity_utilization: 42.1, average_rating: 4.4 },
      { park_id: 'park-5', park_name: 'Magic Castle', total_revenue: 449500, total_bookings: 198, total_visitors: 666, capacity_utilization: 44.7, average_rating: 4.8 },
    ].map(park => ({
      ...park,
      hourly_stats: [],
      weekly_stats: [],
    }));
  }

  // Управление бронированиями
  async getBookingManagement(filters?: any): Promise<BookingManagement> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      bookings: [
        {
          id: 'booking-1',
          booking_number: 'BK240001',
          park_name: 'Fantasy World',
          customer_name: 'Иван Петров',
          customer_phone: '+996 555 123 456',
          booking_date: '2025-02-15',
          time_slot: '10:00-12:00',
          adult_count: 2,
          child_count: 1,
          total_cost: 750,
          status: 'confirmed',
          payment_status: 'paid',
          created_at: '2025-01-30T10:30:00Z',
        },
        {
          id: 'booking-2',
          booking_number: 'BK240002',
          park_name: 'Happy Land',
          customer_name: 'Анна Сидорова',
          customer_phone: '+996 777 987 654',
          booking_date: '2025-02-16',
          time_slot: '14:00-16:00',
          adult_count: 1,
          child_count: 2,
          total_cost: 600,
          status: 'pending',
          payment_status: 'pending',
          created_at: '2025-01-30T11:15:00Z',
        },
        // Добавляем еще записей для демонстрации
        {
          id: 'booking-3',
          booking_number: 'BK240003',
          park_name: 'Kids Zone',
          customer_name: 'Марат Токтосунов',
          customer_phone: '+996 500 111 222',
          booking_date: '2025-02-17',
          time_slot: '16:00-18:00',
          adult_count: 2,
          child_count: 3,
          total_cost: 1050,
          status: 'confirmed',
          payment_status: 'paid',
          created_at: '2025-01-30T09:45:00Z',
        },
      ],
      
      filters: {
        parks: [
          { id: 'park-1', name: 'Fantasy World' },
          { id: 'park-2', name: 'Happy Land' },
          { id: 'park-3', name: 'Kids Zone' },
          { id: 'park-4', name: 'Wonder Park' },
          { id: 'park-5', name: 'Magic Castle' },
        ],
        statuses: ['pending', 'confirmed', 'completed', 'cancelled'],
        date_range: {
          min_date: '2025-01-01',
          max_date: '2025-12-31',
        },
      },
    };
  }

  // Управление пользователями
  async getUserManagement(): Promise<UserManagement> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    return {
      users: [
        {
          id: 'user-1',
          first_name: 'Иван',
          last_name: 'Петров',
          phone: '+996 555 123 456',
          email: 'ivan@example.com',
          loyalty_tier: 'gold',
          loyalty_points: 2450,
          total_bookings: 12,
          total_spent: 8900,
          last_visit: '2025-01-28',
          registration_date: '2024-06-15',
          is_active: true,
        },
        {
          id: 'user-2',
          first_name: 'Анна',
          last_name: 'Сидорова',
          phone: '+996 777 987 654',
          loyalty_tier: 'silver',
          loyalty_points: 1230,
          total_bookings: 8,
          total_spent: 5600,
          last_visit: '2025-01-25',
          registration_date: '2024-08-22',
          is_active: true,
        },
        {
          id: 'user-3',
          first_name: 'Марат',
          last_name: 'Токтосунов',
          phone: '+996 500 111 222',
          email: 'marat@example.com',
          loyalty_tier: 'bronze',
          loyalty_points: 567,
          total_bookings: 4,
          total_spent: 2800,
          last_visit: '2025-01-20',
          registration_date: '2024-11-03',
          is_active: true,
        },
      ],
      
      stats: {
        total_users: 1456,
        active_users: 1398,
        new_users_this_month: 89,
        loyalty_breakdown: {
          bronze: 856,
          silver: 412,
          gold: 156,
          platinum: 32,
        },
      },
    };
  }

  // Подтверждение бронирования
  async confirmBooking(bookingId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Мок операция
  }

  // Отмена бронирования
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Мок операция
  }

  // Экспорт отчета
  async exportReport(type: 'bookings' | 'revenue' | 'users', format: 'xlsx' | 'csv' | 'pdf'): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportData = {
      type,
      format,
      generated_at: new Date().toISOString(),
      data: 'Sample report data...',
    };
    
    return new Blob([JSON.stringify(reportData, null, 2)], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' 
    });
  }

  // Форматирование валюты
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сом';
  }

  // Форматирование процента
  formatPercentage(value: number): string {
    return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
  }

  // Проверка прав доступа
  hasPermission(user: AdminUser, permission: AdminPermission): boolean {
    return user.permissions.includes(permission) || user.role === 'super_admin';
  }

  // Получение цвета тренда
  getTrendColor(value: number): string {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  // Получение иконки тренда
  getTrendIcon(value: number): string {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➖';
  }
}

export const adminService = new AdminService(); 
 