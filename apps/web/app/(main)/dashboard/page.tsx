'use client';

import { useState, useEffect } from 'react';
import { useAsyncData } from '@/hooks';
import { logApiError, logUserAction } from '@/lib/logger';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Ticket, CreditCard, Shield, Bell, Settings, Users, MapPin, Star, Gift } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';
import TicketCard from '@/components/tickets/TicketCard';
import PaymentHistory from '@/components/payment/PaymentHistory';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuthStore } from '@/stores/useAuthStore';
import { bookingService } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';
import { notificationService } from '@/services/notificationService';
import Link from 'next/link';

interface Booking {
  id: string;
  park_name: string;
  booking_date: string;
  time_slot: string;
  adult_count: number;
  child_count: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Ticket {
  id: string;
  ticket_number: string;
  park_name: string;
  visit_date: string;
  time_slot: string;
  ticket_type: string;
  status: string;
  qr_code: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    initializeNotifications();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, ticketsData, notificationsData] = await Promise.all([
        bookingService.getUserBookings(),
        ticketService.getUserTickets(),
        notificationService.getUserNotifications(),
      ]);
      setBookings(bookingsResponse.bookings);
      setTickets(ticketsData);
      setRecentNotifications(notificationsData.slice(0, 3)); // Последние 3
    } catch (error) {
      logApiError('load_dashboard_data', error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const initializeNotifications = async () => {
    // Регистрируем Service Worker для push уведомлений
    if (notificationService.isSupported()) {
      await notificationService.registerServiceWorker();
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      logUserAction('cancel_booking', { booking_id: bookingId });
      await bookingService.cancelBooking(bookingId);
      // Обновляем список бронирований
      await loadUserData();
    } catch (error) {
      logApiError('cancel_booking', error instanceof Error ? error : new Error('Unknown error'), { booking_id: bookingId });
    }
  };

  // Проверяем, является ли пользователь админом
  const { isAdmin } = useAuthStore();

  if (loading) {
    return (
      <PageWrapper title="Личный кабинет" subtitle="Загружаем ваши данные...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="skypark-loading-large mb-4"></div>
            <p className="text-purple-600 font-medium">Загрузка магии...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const headerActions = (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {isAdmin && (
        <Link href="/admin" className="btn-skypark-secondary px-6 py-3">
          <Shield className="w-4 h-4 mr-2" />
          🛡️ Админ-панель
        </Link>
      )}
      
      <Link href="/settings/notifications" className="btn-skypark-outline px-6 py-3">
        <Settings className="w-4 h-4 mr-2" />
        ⚙️ Настройки уведомлений
      </Link>
    </div>
  );

  return (
    <PageWrapper 
      title="Личный кабинет" 
      subtitle={`🎉 Добро пожаловать, ${user?.first_name || 'Пользователь'}! Управляйте своими приключениями в Sky Park`}
      headerContent={headerActions}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="skypark-stat-card skypark-stat-purple">
          <div className="text-center">
            <CalendarDays className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">📅 Бронирований</div>
          </div>
        </div>
        <div className="skypark-stat-card skypark-stat-pink">
          <div className="text-center">
            <Ticket className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-600">{tickets.length}</div>
            <div className="text-sm text-gray-600">🎫 Билетов</div>
          </div>
        </div>
        <div className="skypark-stat-card skypark-stat-blue">
          <div className="text-center">
            <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{recentNotifications.length}</div>
            <div className="text-sm text-gray-600">🔔 Уведомлений</div>
          </div>
        </div>
        <div className="skypark-stat-card skypark-stat-green">
          <div className="text-center">
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">4.9</div>
            <div className="text-sm text-gray-600">⭐ Ваш рейтинг</div>
          </div>
        </div>
      </div>

      {/* Последние уведомления */}
      {recentNotifications.length > 0 && (
        <div className="skypark-card-highlight mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-skypark-gradient">
                🔔 Последние уведомления
              </h2>
            </div>
            <Link
              href="/notifications"
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
            >
              Все уведомления →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`skypark-card-compact ${
                  !notification.is_read ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-gray-600">
                      {notification.body}
                    </p>
                  </div>
                  <div className="ml-4 text-xs text-purple-500 font-medium">
                    {notificationService.formatNotificationTime(notification.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="bookings" className="space-y-8">
        <div className="skypark-tabs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <TabsTrigger 
              value="bookings" 
              className="skypark-tab data-[state=active]:skypark-tab data-[state=active]:active"
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              📅 Мои бронирования
            </TabsTrigger>
            <TabsTrigger 
              value="tickets" 
              className="skypark-tab data-[state=active]:skypark-tab data-[state=active]:active"
            >
              <Ticket className="w-5 h-5 mr-2" />
              🎫 Мои билеты
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="skypark-tab data-[state=active]:skypark-tab data-[state=active]:active"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              💳 История платежей
            </TabsTrigger>
          </div>
        </div>

        <TabsContent value="bookings">
          <div className="skypark-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
                📅 Мои бронирования
              </h2>
              <p className="text-gray-600">Управляйте своими визитами в Sky Park</p>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="skypark-float mb-4">
                  <CalendarDays className="w-16 h-16 text-purple-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🎪 Время для новых приключений!
                </h3>
                <p className="text-gray-600 mb-6">
                  У вас пока нет бронирований. Давайте исправим это!
                </p>
                <Link href="/parks" className="btn-skypark-primary px-8 py-3">
                  🗺️ Выбрать парк
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="skypark-card-compact">
                    <BookingCard
                      booking={booking}
                      onCancel={handleCancelBooking}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="skypark-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
                🎫 Мои билеты
              </h2>
              <p className="text-gray-600">Ваши пропуски в мир развлечений</p>
            </div>
            
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="skypark-float mb-4">
                  <Ticket className="w-16 h-16 text-pink-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🎪 Билеты появятся здесь!
                </h3>
                <p className="text-gray-600 mb-6">
                  После оплаты бронирования вы получите электронные билеты
                </p>
                <Link href="/parks" className="btn-skypark-primary px-8 py-3">
                  🎟️ Забронировать билеты
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="skypark-card-compact">
                    <TicketCard ticket={ticket} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="skypark-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
                💳 История платежей
              </h2>
              <p className="text-gray-600">Все ваши транзакции в одном месте</p>
            </div>
            <PaymentHistory />
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
} 