import { API_BASE_URL } from '@/lib/utils';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type PaymentProvider = 'mbank' | 'odengi' | 'elcart' | 'optimabank' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  name: string;
  icon: string;
  description: string;
  fee_percentage: number;
  min_amount: number;
  max_amount: number;
  is_available: boolean;
  supports_refund: boolean;
  processing_time: string;
}

export interface PaymentCard {
  last4: string;
  brand: string;
  expiry_month: number;
  expiry_year: number;
  holder_name?: string;
}

export interface PaymentRequest {
  booking_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  payment_method_id?: string;
  card_data?: {
    number: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
    holder_name: string;
  };
  phone_number?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  original_amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  exchange_rate?: number;
  original_currency?: string;
  provider_transaction_id?: string;
  provider_reference?: string;
  card?: PaymentCard;
  phone_number?: string;
  description?: string;
  failure_reason?: string;
  initiated_at?: string;
  authorized_at?: string;
  captured_at?: string;
  failed_at?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStats {
  total_payments: number;
  completed_payments: number;
  failed_payments: number;
  total_revenue: number;
  average_payment: number;
  payments_by_provider: Record<PaymentProvider, number>;
  daily_revenue: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

class PaymentService {
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

  // Получение доступных методов оплаты
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // Мок-данные для киргизских платежных систем
    return [
      {
        id: 'mbank_card',
        provider: 'mbank',
        name: 'mBank',
        icon: '🏦',
        description: 'Оплата картой через mBank',
        fee_percentage: 2.5,
        min_amount: 50,
        max_amount: 100000,
        is_available: true,
        supports_refund: true,
        processing_time: 'мгновенно',
      },
      {
        id: 'odengi_wallet',
        provider: 'odengi',
        name: 'O!Деньги',
        icon: '📱',
        description: 'Электронный кошелек O!Деньги',
        fee_percentage: 1.5,
        min_amount: 10,
        max_amount: 50000,
        is_available: true,
        supports_refund: true,
        processing_time: 'мгновенно',
      },
      {
        id: 'elcart_card',
        provider: 'elcart',
        name: 'ЭлКарт',
        icon: '💳',
        description: 'Банковские карты ЭлКарт',
        fee_percentage: 2.0,
        min_amount: 100,
        max_amount: 200000,
        is_available: true,
        supports_refund: true,
        processing_time: 'до 1 минуты',
      },
      {
        id: 'optimabank_card',
        provider: 'optimabank',
        name: 'Optima Bank',
        icon: '🔷',
        description: 'Карты Optima Bank',
        fee_percentage: 2.2,
        min_amount: 50,
        max_amount: 150000,
        is_available: true,
        supports_refund: true,
        processing_time: 'до 2 минут',
      },
      {
        id: 'cash_payment',
        provider: 'cash',
        name: 'Наличные',
        icon: '💵',
        description: 'Оплата наличными на месте',
        fee_percentage: 0,
        min_amount: 1,
        max_amount: 999999,
        is_available: true,
        supports_refund: false,
        processing_time: 'при посещении',
      },
    ];
  }

  // Создание платежа
  async createPayment(paymentData: PaymentRequest): Promise<Payment> {
    // Мок реализация - в реальности отправляем запрос на бэкенд
    await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация запроса

    const mockPayment: Payment = {
      id: this.generateId(),
      booking_id: paymentData.booking_id,
      user_id: 'current-user-id',
      provider: paymentData.provider,
      status: 'processing',
      amount: paymentData.amount,
      original_amount: paymentData.amount,
      fee_amount: Math.round(paymentData.amount * 0.025), // 2.5% комиссия
      net_amount: paymentData.amount - Math.round(paymentData.amount * 0.025),
      currency: paymentData.currency,
      provider_transaction_id: this.generateTransactionId(),
      initiated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Симулируем обработку платежа
    setTimeout(() => {
      this.simulatePaymentProcessing(mockPayment.id);
    }, 2000);

    return mockPayment;
  }

  // Получение статуса платежа
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    // Мок реализация
    await new Promise(resolve => setTimeout(resolve, 500));

    const status = Math.random() > 0.1 ? 'completed' : 'failed';
    
    return {
      id: paymentId,
      booking_id: 'booking-id',
      user_id: 'user-id',
      provider: 'mbank',
      status: status,
      amount: 300,
      original_amount: 300,
      fee_amount: 7.5,
      net_amount: 292.5,
      currency: 'KGS',
      provider_transaction_id: this.generateTransactionId(),
      captured_at: status === 'completed' ? new Date().toISOString() : undefined,
      failed_at: status === 'failed' ? new Date().toISOString() : undefined,
      failure_reason: status === 'failed' ? 'Недостаточно средств на карте' : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Получение истории платежей пользователя
  async getUserPayments(): Promise<Payment[]> {
    if (DEMO_MODE) {
      // Мок данные
      await new Promise(resolve => setTimeout(resolve, 800));

      return [
      {
        id: '1',
        booking_id: 'booking-1',
        user_id: 'user-1',
        provider: 'mbank',
        status: 'completed',
        amount: 450,
        original_amount: 450,
        fee_amount: 11.25,
        net_amount: 438.75,
        currency: 'KGS',
        provider_transaction_id: 'TXN_' + Date.now(),
        captured_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        booking_id: 'booking-2',
        user_id: 'user-1',
        provider: 'odengi',
        status: 'failed',
        amount: 300,
        original_amount: 300,
        fee_amount: 4.5,
        net_amount: 295.5,
        currency: 'KGS',
        failure_reason: 'Превышен лимит транзакций',
        failed_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    }

    // В production режиме делаем реальный запрос
    const response = await this.fetchWithAuth('/payments/history');
    if (!response.ok) {
      throw new Error('Не удалось загрузить историю платежей');
    }
    const data = await response.json();
    return data.data;
  }

  // Возврат платежа
  async refundPayment(paymentId: string, amount?: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Мок реализация
  }

  // Валидация карточных данных
  validateCardNumber(cardNumber: string): boolean {
    // Простая валидация по алгоритму Луна
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return month >= 1 && month <= 12;
  }

  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  // Форматирование номера карты
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').trim();
  }

  // Определение типа карты
  getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]|^2[2-7]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6/.test(cleaned)) return 'Discover';
    
    return 'Unknown';
  }

  // Форматирование статуса платежа
  formatPaymentStatus(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      pending: 'Ожидает оплаты',
      processing: 'Обрабатывается',
      completed: 'Завершен',
      failed: 'Ошибка',
      cancelled: 'Отменен',
      refunded: 'Возвращен',
    };
    return statusMap[status] || status;
  }

  // Цвет статуса платежа
  getStatusColor(status: PaymentStatus): string {
    const colorMap: Record<PaymentStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      processing: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
      refunded: 'text-purple-600 bg-purple-50 border-purple-200',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  }

  // Форматирование суммы
  formatAmount(amount: number, currency: string = 'KGS'): string {
    const formatted = new Intl.NumberFormat('ru-RU').format(amount);
    const currencySymbol = currency === 'KGS' ? 'сом' : currency;
    return `${formatted} ${currencySymbol}`;
  }

  // Расчет комиссии
  calculateFee(amount: number, provider: PaymentProvider): number {
    const feeRates: Record<PaymentProvider, number> = {
      mbank: 0.025,      // 2.5%
      odengi: 0.015,     // 1.5%
      elcart: 0.02,      // 2.0%
      optimabank: 0.022, // 2.2%
      cash: 0,           // 0%
    };
    
    return Math.round(amount * (feeRates[provider] || 0.025));
  }

  // Генерация уникальных ID (мок)
  private generateId(): string {
    return 'pay_' + Math.random().toString(36).substr(2, 9);
  }

  private generateTransactionId(): string {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Симуляция обработки платежа
  private simulatePaymentProcessing(paymentId: string): void {
    // В реальном приложении здесь будет WebSocket или polling
    console.log(`Обработка платежа ${paymentId} завершена`);
  }

  // Получение статистики платежей (для админов)
  async getPaymentStats(): Promise<PaymentStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      total_payments: 156,
      completed_payments: 142,
      failed_payments: 14,
      total_revenue: 47850,
      average_payment: 337,
      payments_by_provider: {
        mbank: 67,
        odengi: 45,
        elcart: 28,
        optimabank: 12,
        cash: 4,
      },
      daily_revenue: [
        { date: '2025-01-30', revenue: 2100, count: 7 },
        { date: '2025-01-29', revenue: 1850, count: 6 },
        { date: '2025-01-28', revenue: 2450, count: 8 },
      ],
    };
  }
}

export const paymentService = new PaymentService(); 
 