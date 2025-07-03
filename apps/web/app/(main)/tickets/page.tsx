'use client';

import { useState, useEffect } from 'react';
import { useAsyncData } from '@/hooks';
import { logApiError } from '@/lib/logger';
import TicketList from '@/components/tickets/TicketList';
import { ticketService } from '@/services/ticketService';
import { useAuthStore } from '@/stores/useAuthStore';
import { Ticket, TicketHistoryEntry } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageWrapper from '@/components/layout/PageWrapper';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  History,
  QrCode,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function TicketsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [expiredTickets, setExpiredTickets] = useState<Ticket[]>([]);
  const [usedTickets, setUsedTickets] = useState<Ticket[]>([]);
  const [ticketHistory, setTicketHistory] = useState<TicketHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [active, expired, used, history] = await Promise.all([
        ticketService.getUserTickets({ status: 'active' }),
        ticketService.getUserTickets({ status: 'expired' }),
        ticketService.getUserTickets({ status: 'used' }),
        ticketService.getTicketHistory(),
      ]);

      setActiveTickets(active);
      setExpiredTickets(expired);
      setUsedTickets(used);
      setTicketHistory(history);
    } catch (error) {
      logApiError('load_tickets', error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper
        title="Мои билеты"
        subtitle="🎫 Войдите в аккаунт, чтобы просматривать билеты"
        showNavigation={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="skypark-card text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🔐 Нужна авторизация
            </h2>
            <p className="text-gray-600 mb-6">
              Чтобы просматривать билеты и управлять бронированиями, войдите в свой аккаунт
            </p>
            <Link href="/auth/login">
              <button className="btn-skypark-primary px-8 py-3 text-base">
                🎈 Войти в аккаунт
              </button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper
        title="Мои билеты"
        subtitle="🎫 Загружаем ваши билеты..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="skypark-loading-large mb-6"></div>
            <p className="text-purple-600 font-medium">Собираем ваши приключения...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const totalActive = activeTickets.length;
  const totalExpired = expiredTickets.length;
  const totalUsed = usedTickets.length;

  // Header content с статистикой
  const headerContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
      <div className="skypark-stat-card skypark-stat-card-green text-center">
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalActive}</div>
        <div className="text-sm text-gray-600">🎫 Активные билеты</div>
      </div>
      
      <div className="skypark-stat-card skypark-stat-card-blue text-center">
        <TicketIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalUsed}</div>
        <div className="text-sm text-gray-600">✅ Использованные</div>
      </div>
      
      <div className="skypark-stat-card skypark-stat-card-purple text-center">
        <Clock className="w-10 h-10 text-orange-600 mx-auto mb-3" />
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalExpired}</div>
        <div className="text-sm text-gray-600">⏰ Просроченные</div>
      </div>

      <div className="skypark-stat-card skypark-stat-card-pink text-center">
        <QrCode className="w-10 h-10 text-pink-600 mx-auto mb-3" />
        <div className="text-3xl font-bold text-gray-900 mb-1">{totalActive + totalUsed}</div>
        <div className="text-sm text-gray-600">📱 Всего билетов</div>
      </div>
    </div>
  );

  return (
    <PageWrapper
      title="Мои билеты"
      subtitle="🎫 Управляйте своими билетами и просматривайте историю волшебных приключений в Sky Park"
      headerContent={headerContent}
    >
      {/* Основной контент с табами */}
      <div className="skypark-card">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="skypark-tabs grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="active" className="skypark-tab">
              <CheckCircle className="w-4 h-4 mr-2" />
              🎫 Активные ({totalActive})
            </TabsTrigger>
            <TabsTrigger value="used" className="skypark-tab">
              <TicketIcon className="w-4 h-4 mr-2" />
              ✅ Использованные ({totalUsed})
            </TabsTrigger>
            <TabsTrigger value="expired" className="skypark-tab">
              <Clock className="w-4 h-4 mr-2" />
              ⏰ Просроченные ({totalExpired})
            </TabsTrigger>
            <TabsTrigger value="history" className="skypark-tab">
              <History className="w-4 h-4 mr-2" />
              📚 История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeTickets.length > 0 ? (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-skypark-gradient mb-2">
                    🎪 Готовы к приключениям!
                  </h3>
                  <p className="text-gray-600">Ваши активные билеты готовы к использованию</p>
                </div>
                <TicketList />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TicketIcon className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🎫 Пока нет активных билетов
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Выберите один из наших удивительных парков и забронируйте билеты для незабываемых приключений!
                </p>
                <Link href="/parks">
                  <button className="btn-skypark-primary px-8 py-3 text-base">
                    🏰 Забронировать билеты
                  </button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="used" className="mt-6">
            {usedTickets.length > 0 ? (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-skypark-gradient mb-2">
                    ✨ Воспоминания о приключениях
                  </h3>
                  <p className="text-gray-600">Билеты, которые подарили незабываемые моменты</p>
                </div>
                <TicketList />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  📝 История использованных билетов пуста
                </h3>
                <p className="text-gray-600">Первые приключения еще впереди!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="mt-6">
            {expiredTickets.length > 0 ? (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-skypark-gradient mb-2">
                    ⏰ Упущенные возможности
                  </h3>
                  <p className="text-gray-600">Билеты, срок действия которых истек</p>
                </div>
                <TicketList />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🎉 Просроченных билетов нет!
                </h3>
                <p className="text-gray-600">Отлично управляете своими приключениями!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {ticketHistory.length > 0 ? (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-skypark-gradient mb-2">
                    📚 История ваших приключений
                  </h3>
                  <p className="text-gray-600">Подробная хронология всех активностей</p>
                </div>
                <div className="space-y-4">
                  {ticketHistory.map((entry) => (
                    <div key={entry.id} className="skypark-card-compact">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{entry.park_name}</h4>
                            <p className="text-sm text-gray-600">{entry.action_description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-900 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {entry.formatted_date}
                          </div>
                          <p className="text-xs text-gray-500">{entry.formatted_time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  📖 История действий пуста
                </h3>
                <p className="text-gray-600">Ваши первые приключения только начинаются!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Призыв к действию */}
      {(totalActive === 0 && totalUsed === 0) && (
        <div className="skypark-card-highlight mt-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-skypark-gradient mb-4">
              🚀 Готовы к новым приключениям?
            </h3>
            <p className="text-gray-600 mb-8">
              Откройте для себя мир волшебных развлечений в наших парках! 
              Безопасные игровые зоны, захватывающие аттракционы и море веселья ждут вас.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/parks">
                <button className="btn-skypark-primary px-8 py-3">
                  🏰 Выбрать парк
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-skypark-outline px-8 py-3">
                  👤 Личный кабинет
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

 
 