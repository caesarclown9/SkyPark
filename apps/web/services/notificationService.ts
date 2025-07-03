import { API_BASE_URL } from '@/lib/utils';

export type NotificationType = 
  | 'booking_confirmed' 
  | 'booking_reminder' 
  | 'payment_success' 
  | 'ticket_generated'
  | 'loyalty_bonus'
  | 'marketing_offer'
  | 'system_message';

export interface PushNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  icon?: string;
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  enabled: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  marketing_notifications: boolean;
  reminder_notifications: boolean;
  loyalty_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  recent_notifications: PushNotification[];
}

class NotificationService {
  private vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqILzMWwfh'; // Мок ключ

  // Проверка поддержки push уведомлений
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Регистрация Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Push уведомления не поддерживаются');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker зарегистрирован:', registration);
      return registration;
    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error);
      return null;
    }
  }

  // Запрос разрешения на уведомления
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Разрешение на уведомления:', permission);
      return permission;
    } catch (error) {
      console.error('Ошибка запроса разрешения:', error);
      return 'denied';
    }
  }

  // Подписка на push уведомления
  async subscribeToPush(): Promise<PushSubscription | null> {
    const registration = await this.registerServiceWorker();
    if (!registration) return null;

    const permission = await this.requestPermission();
    if (permission !== 'granted') return null;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push подписка создана:', subscription);
      
      // Отправляем подписку на сервер
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Ошибка создания push подписки:', error);
      return null;
    }
  }

  // Отправка подписки на сервер
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // Мок отправки на сервер
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Подписка отправлена на сервер:', subscription);
    
    // Здесь будет реальный API запрос
    // await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subscription })
    // });
  }

  // Отправка локального уведомления
  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Уведомления недоступны');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      ...options
    };

    new Notification(title, defaultOptions);
  }

  // Получение уведомлений пользователя
  async getUserNotifications(): Promise<PushNotification[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Мок данные
    return [
      {
        id: 'notif-1',
        user_id: 'user-1',
        title: 'Бронирование подтверждено! 🎉',
        body: 'Ваше бронирование в Fantasy World на 15 февраля подтверждено',
        type: 'booking_confirmed',
        data: { booking_id: 'booking-1', park_name: 'Fantasy World' },
        icon: '/icons/booking.png',
        is_read: false,
        created_at: '2025-01-30T10:30:00Z',
      },
      {
        id: 'notif-2',
        user_id: 'user-1',
        title: 'Оплата прошла успешно 💳',
        body: 'Оплата 750 сом через mBank прошла успешно. Билеты готовы!',
        type: 'payment_success',
        data: { payment_id: 'payment-1', amount: 750 },
        icon: '/icons/payment.png',
        is_read: true,
        read_at: '2025-01-30T11:00:00Z',
        created_at: '2025-01-30T10:45:00Z',
      },
      {
        id: 'notif-3',
        user_id: 'user-1',
        title: 'Напоминание о визите 📅',
        body: 'Завтра ваш визит в Happy Land в 14:00. Не забудьте билеты!',
        type: 'booking_reminder',
        data: { booking_id: 'booking-2', visit_time: '14:00' },
        icon: '/icons/reminder.png',
        is_read: false,
        created_at: '2025-01-29T18:00:00Z',
      },
      {
        id: 'notif-4',
        user_id: 'user-1',
        title: 'Новые бонусы! 🎁',
        body: 'Вы получили 50 бонусных баллов за последний визит',
        type: 'loyalty_bonus',
        data: { points: 50, total_points: 1250 },
        icon: '/icons/loyalty.png',
        is_read: false,
        created_at: '2025-01-29T16:30:00Z',
      },
      {
        id: 'notif-5',
        user_id: 'user-1',
        title: 'Специальное предложение! 🔥',
        body: 'Скидка 20% на посещение в выходные. Акция до конца месяца!',
        type: 'marketing_offer',
        data: { discount: 20, valid_until: '2025-01-31' },
        icon: '/icons/offer.png',
        is_read: true,
        read_at: '2025-01-29T12:00:00Z',
        created_at: '2025-01-29T10:00:00Z',
      },
    ];
  }

  // Отметка уведомления как прочитанного
  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Уведомление отмечено как прочитанное:', notificationId);
  }

  // Получение настроек уведомлений
  async getNotificationSettings(): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      enabled: true,
      booking_notifications: true,
      payment_notifications: true,
      marketing_notifications: true,
      reminder_notifications: true,
      loyalty_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
    };
  }

  // Обновление настроек уведомлений
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Настройки уведомлений обновлены:', settings);
  }

  // Отправка push уведомления (для админов)
  async sendPushNotification(
    userIds: string[],
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, any>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('Push уведомление отправлено:', { userIds, title, body, type, data });
  }

  // Отправка массовых уведомлений
  async sendBulkNotification(
    segment: 'all' | 'active' | 'loyal' | 'new',
    title: string,
    body: string,
    type: NotificationType
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Массовое уведомление отправлено:', { segment, title, body, type });
  }

  // Статистика уведомлений (для админов)
  async getNotificationStats(): Promise<NotificationStats> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      total_sent: 12456,
      total_delivered: 11890,
      total_opened: 8934,
      total_clicked: 3456,
      delivery_rate: 95.5,
      open_rate: 75.1,
      click_rate: 38.7,
      recent_notifications: await this.getUserNotifications()
    };
  }

  // Планирование уведомлений
  async scheduleNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    scheduledAt: Date,
    data?: Record<string, any>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('Уведомление запланировано:', {
      userId, title, body, type, scheduledAt, data
    });
  }

  // Автоматические уведомления для бронирований
  async setupBookingNotifications(bookingId: string): Promise<void> {
    // Уведомление о подтверждении
    await this.scheduleNotification(
      'user-1',
      'Бронирование подтверждено! 🎉',
      'Ваше бронирование успешно подтверждено',
      'booking_confirmed',
      new Date(),
      { booking_id: bookingId }
    );

    // Напоминание за день
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 1);
    
    await this.scheduleNotification(
      'user-1',
      'Напоминание о визите 📅',
      'Завтра ваш визит в парк. Не забудьте билеты!',
      'booking_reminder',
      reminderDate,
      { booking_id: bookingId }
    );
  }

  // Автоматические уведомления о лояльности
  async setupLoyaltyNotifications(userId: string, points: number): Promise<void> {
    if (points >= 100) {
      await this.scheduleNotification(
        userId,
        'Новые бонусы! 🎁',
        `Вы получили ${points} бонусных баллов!`,
        'loyalty_bonus',
        new Date(),
        { points, total_points: points + 1000 }
      );
    }
  }

  // Конвертация VAPID ключа
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Получение иконки для типа уведомления
  getNotificationIcon(type: NotificationType): string {
    const icons = {
      booking_confirmed: '🎉',
      booking_reminder: '📅',
      payment_success: '💳',
      ticket_generated: '🎫',
      loyalty_bonus: '🎁',
      marketing_offer: '🔥',
      system_message: '📢',
    };
    
    return icons[type] || '📱';
  }

  // Форматирование времени уведомления
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  }
}

export const notificationService = new NotificationService(); 