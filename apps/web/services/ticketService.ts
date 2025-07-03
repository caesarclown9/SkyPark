import { API_BASE_URL } from '@/lib/utils';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type TicketStatus = 'active' | 'used' | 'expired' | 'cancelled' | 'refunded';
export type TicketType = 'adult' | 'child' | 'group' | 'vip';

export interface TicketQR {
  qr_code: string;
  qr_data: string;
  validation_code: string;
  expires_at: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  payment_id: string;
  user_id: string;
  park_id: string;
  ticket_number: string;
  ticket_type: TicketType;
  status: TicketStatus;
  
  // Информация о билете
  holder_name: string;
  holder_age?: number;
  visit_date: string;
  time_slot: string;
  gate_number?: string;
  
  // QR-код данные
  qr_code: string;
  qr_data: string;
  validation_code: string;
  security_hash: string;
  
  // Ценовая информация
  original_price: number;
  paid_price: number;
  discount_amount?: number;
  discount_reason?: string;
  
  // Метаданные
  issued_at: string;
  valid_from: string;
  valid_until: string;
  used_at?: string;
  used_gate?: string;
  
  // Дополнительная информация
  special_needs?: string;
  meal_included?: boolean;
  parking_included?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface TicketBundle {
  bundle_id: string;
  booking_id: string;
  tickets: Ticket[];
  total_tickets: number;
  bundle_qr?: string;
  family_discount?: number;
  group_leader?: string;
}

export interface TicketValidation {
  is_valid: boolean;
  ticket?: Ticket;
  validation_time: string;
  gate_number?: string;
  error_code?: string;
  error_message?: string;
  remaining_uses?: number;
}

export interface TicketStats {
  total_issued: number;
  active_tickets: number;
  used_tickets: number;
  expired_tickets: number;
  refunded_tickets: number;
  validation_rate: number;
  popular_time_slots: Array<{
    time_slot: string;
    count: number;
  }>;
  gate_usage: Array<{
    gate: string;
    count: number;
  }>;
}

class TicketService {
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

  // Генерация билетов после успешной оплаты
  async generateTicketsFromBooking(bookingId: string, paymentId: string): Promise<TicketBundle> {
    // Мок реализация
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockTickets: Ticket[] = [
      {
        id: this.generateTicketId(),
        booking_id: bookingId,
        payment_id: paymentId,
        user_id: 'current-user-id',
        park_id: 'park-1',
        ticket_number: this.generateTicketNumber(),
        ticket_type: 'adult',
        status: 'active',
        holder_name: 'Иван Петров',
        visit_date: '2025-02-15',
        time_slot: '10:00-12:00',
        gate_number: 'A1',
        qr_code: this.generateQRCode(),
        qr_data: this.generateQRData(bookingId, 'adult'),
        validation_code: this.generateValidationCode(),
        security_hash: this.generateSecurityHash(),
        original_price: 300,
        paid_price: 300,
        issued_at: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: this.generateTicketId(),
        booking_id: bookingId,
        payment_id: paymentId,
        user_id: 'current-user-id',
        park_id: 'park-1',
        ticket_number: this.generateTicketNumber(),
        ticket_type: 'child',
        status: 'active',
        holder_name: 'Анна Петрова',
        holder_age: 8,
        visit_date: '2025-02-15',
        time_slot: '10:00-12:00',
        gate_number: 'A1',
        qr_code: this.generateQRCode(),
        qr_data: this.generateQRData(bookingId, 'child'),
        validation_code: this.generateValidationCode(),
        security_hash: this.generateSecurityHash(),
        original_price: 150,
        paid_price: 150,
        issued_at: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return {
      bundle_id: this.generateBundleId(),
      booking_id: bookingId,
      tickets: mockTickets,
      total_tickets: mockTickets.length,
      bundle_qr: this.generateQRCode(),
      family_discount: 0,
      group_leader: 'Иван Петров',
    };
  }

  // Получение билетов пользователя
  async getUserTickets(): Promise<Ticket[]> {
    if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Возвращаем мок-данные
    return [
      {
        id: 'ticket-1',
        booking_id: 'booking-1',
        payment_id: 'payment-1',
        user_id: 'user-1',
        park_id: 'park-1',
        ticket_number: 'SP240001',
        ticket_type: 'adult',
        status: 'active',
        holder_name: 'Иван Петров',
        visit_date: '2025-02-15',
        time_slot: '10:00-12:00',
        gate_number: 'A1',
        qr_code: 'QR123456789',
        qr_data: 'skypark://ticket/booking-1/adult/300/2025-02-15T10:00:00Z',
        validation_code: 'VAL789',
        security_hash: 'HASH123',
        original_price: 300,
        paid_price: 300,
        issued_at: new Date(Date.now() - 86400000).toISOString(),
        valid_from: new Date(Date.now() - 86400000).toISOString(),
        valid_until: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'ticket-2',
        booking_id: 'booking-1',
        payment_id: 'payment-1',
        user_id: 'user-1',
        park_id: 'park-1',
        ticket_number: 'SP240002',
        ticket_type: 'child',
        status: 'used',
        holder_name: 'Анна Петрова',
        holder_age: 8,
        visit_date: '2025-01-28',
        time_slot: '14:00-16:00',
        gate_number: 'B2',
        qr_code: 'QR987654321',
        qr_data: 'skypark://ticket/booking-1/child/150/2025-01-28T14:00:00Z',
        validation_code: 'VAL456',
        security_hash: 'HASH456',
        original_price: 150,
        paid_price: 150,
        issued_at: new Date(Date.now() - 172800000).toISOString(),
        valid_from: new Date(Date.now() - 172800000).toISOString(),
        valid_until: new Date(Date.now() - 86400000).toISOString(),
        used_at: new Date(Date.now() - 86400000).toISOString(),
        used_gate: 'B2',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    }

    // В production режиме делаем реальный запрос
    const response = await this.fetchWithAuth('/tickets');
    if (!response.ok) {
      throw new Error('Не удалось загрузить билеты');
    }
    const data = await response.json();
    return data.data;
  }

  // Получение конкретного билета
  async getTicketById(ticketId: string): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tickets = await this.getUserTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
      throw new Error('Билет не найден');
    }
    
    return ticket;
  }

  // Валидация билета по QR-коду
  async validateTicket(qrData: string, gateNumber?: string): Promise<TicketValidation> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Парсим данные QR-кода
    const isValidFormat = qrData.startsWith('skypark://ticket/');
    
    if (!isValidFormat) {
      return {
        is_valid: false,
        validation_time: new Date().toISOString(),
        error_code: 'INVALID_FORMAT',
        error_message: 'Неверный формат QR-кода',
      };
    }

    // Симуляция валидации
    const isValid = Math.random() > 0.1; // 90% успешных валидаций
    
    if (!isValid) {
      return {
        is_valid: false,
        validation_time: new Date().toISOString(),
        gate_number: gateNumber,
        error_code: 'TICKET_EXPIRED',
        error_message: 'Билет просрочен или уже использован',
      };
    }

    // Возвращаем успешную валидацию с билетом
    const tickets = await this.getUserTickets();
    return {
      is_valid: true,
      ticket: tickets[0], // Возвращаем первый билет как пример
      validation_time: new Date().toISOString(),
      gate_number: gateNumber,
    };
  }

  // Отмена билета
  async cancelTicket(ticketId: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Мок реализация отмены
  }

  // Отправка билетов на email
  async sendTicketsToEmail(ticketIds: string[], email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Мок реализация отправки email
  }

  // Генерация PDF билета
  async generateTicketPDF(ticketId: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Мок генерация PDF
    const pdfContent = JSON.stringify({
      ticket_id: ticketId,
      generated_at: new Date().toISOString(),
      format: 'PDF',
    });
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Статистика билетов
  async getTicketStats(): Promise<TicketStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      total_issued: 1247,
      active_tickets: 89,
      used_tickets: 1089,
      expired_tickets: 47,
      refunded_tickets: 22,
      validation_rate: 0.87,
      popular_time_slots: [
        { time_slot: '10:00-12:00', count: 234 },
        { time_slot: '14:00-16:00', count: 198 },
        { time_slot: '16:00-18:00', count: 167 },
      ],
      gate_usage: [
        { gate: 'A1', count: 456 },
        { gate: 'B2', count: 389 },
        { gate: 'C3', count: 244 },
      ],
    };
  }

  // Форматирование статуса билета
  formatTicketStatus(status: TicketStatus): string {
    const statusMap: Record<TicketStatus, string> = {
      active: 'Активный',
      used: 'Использован',
      expired: 'Просрочен',
      cancelled: 'Отменен',
      refunded: 'Возвращен',
    };
    return statusMap[status] || status;
  }

  // Цвет статуса билета
  getStatusColor(status: TicketStatus): string {
    const colorMap: Record<TicketStatus, string> = {
      active: 'text-green-600 bg-green-50 border-green-200',
      used: 'text-gray-600 bg-gray-50 border-gray-200',
      expired: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      refunded: 'text-purple-600 bg-purple-50 border-purple-200',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  }

  // Иконка типа билета
  getTicketTypeIcon(type: TicketType): string {
    const iconMap: Record<TicketType, string> = {
      adult: '👨',
      child: '👶',
      group: '👥',
      vip: '👑',
    };
    return iconMap[type] || '🎫';
  }

  // Название типа билета
  getTicketTypeName(type: TicketType): string {
    const nameMap: Record<TicketType, string> = {
      adult: 'Взрослый',
      child: 'Детский',
      group: 'Групповой',
      vip: 'VIP',
    };
    return nameMap[type] || type;
  }

  // Проверка валидности билета
  isTicketValid(ticket: Ticket): boolean {
    const now = new Date();
    const validFrom = new Date(ticket.valid_from);
    const validUntil = new Date(ticket.valid_until);
    
    return ticket.status === 'active' && 
           now >= validFrom && 
           now <= validUntil;
  }

  // Время до истечения билета
  getTimeUntilExpiry(ticket: Ticket): string {
    const now = new Date();
    const validUntil = new Date(ticket.valid_until);
    const diffMs = validUntil.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Просрочен';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} дн.`;
    } else if (diffHours > 0) {
      return `${diffHours} ч.`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} мин.`;
    }
  }

  // Генераторы данных (мок)
  private generateTicketId(): string {
    return 'ticket_' + Math.random().toString(36).substr(2, 9);
  }

  private generateTicketNumber(): string {
    const prefix = 'SP';
    const year = new Date().getFullYear().toString().slice(2);
    const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}${year}${number}`;
  }

  private generateBundleId(): string {
    return 'bundle_' + Math.random().toString(36).substr(2, 9);
  }

  private generateQRCode(): string {
    return 'QR_' + Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  private generateQRData(bookingId: string, ticketType: string): string {
    const timestamp = new Date().toISOString();
    const price = ticketType === 'adult' ? 300 : 150;
    return `skypark://ticket/${bookingId}/${ticketType}/${price}/${timestamp}`;
  }

  private generateValidationCode(): string {
    return 'VAL' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private generateSecurityHash(): string {
    return 'HASH_' + Math.random().toString(36).substr(2, 16).toUpperCase();
  }

  // Форматирование времени
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTimeSlot(timeSlot: string): string {
    return timeSlot.replace('-', ' - ');
  }

  // Скачивание билета как изображение
  async downloadTicketAsImage(ticketId: string): Promise<void> {
    // В реальном приложении здесь будет генерация изображения билета
    const ticket = await this.getTicketById(ticketId);
    
    // Создаем простой JSON для демонстрации
    const ticketData = {
      ticket_number: ticket.ticket_number,
      holder_name: ticket.holder_name,
      visit_date: ticket.visit_date,
      time_slot: ticket.time_slot,
      qr_code: ticket.qr_code,
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${ticket.ticket_number}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}

export const ticketService = new TicketService(); 
 