'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import PaymentCard from './PaymentCard';
import { paymentService, type Payment, type PaymentStatus } from '@/services/paymentService';
import { bookingService, type Booking } from '@/services/bookingService';

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Record<string, Booking>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const userPayments = await paymentService.getUserPayments();
      setPayments(userPayments);

      // Загружаем информацию о бронированиях для каждого платежа
      const bookingPromises = userPayments.map(payment => 
        bookingService.getBookingById(payment.booking_id).catch(() => null)
      );
      
      const bookingResults = await Promise.all(bookingPromises);
      const bookingsMap: Record<string, Booking> = {};
      
      bookingResults.forEach((booking, index) => {
        if (booking) {
          bookingsMap[userPayments[index].booking_id] = booking;
        }
      });
      
      setBookings(bookingsMap);
    } catch (error) {
      console.error('Ошибка загрузки истории платежей:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    // Фильтр по статусу
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          if (paymentDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (paymentDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (paymentDate < monthAgo) return false;
          break;
      }
    }

    // Фильтр по поиску
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const booking = bookings[payment.booking_id];
      
      return (
        payment.id.toLowerCase().includes(searchLower) ||
        payment.provider.toLowerCase().includes(searchLower) ||
        payment.provider_transaction_id?.toLowerCase().includes(searchLower) ||
        booking?.park?.name?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Вы уверены, что хотите вернуть этот платеж?')) {
      return;
    }

    try {
      await paymentService.refundPayment(paymentId);
      await loadPayments(); // Перезагружаем список
      alert('Возврат оформлен успешно!');
    } catch (error) {
      console.error('Ошибка возврата:', error);
      alert('Ошибка при оформлении возврата');
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // Логика скачивания чека
    console.log('Скачивание чека для платежа:', paymentId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-sky-600" />
          <h2 className="text-xl font-semibold text-gray-900">История платежей</h2>
        </div>
        <div className="text-sm text-gray-600">
          Всего: {payments.length} платежей
        </div>
      </div>

      {/* Фильтры и поиск */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по номеру, парку..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Фильтр по статусу */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">Все статусы</option>
              <option value="completed">Завершен</option>
              <option value="processing">Обрабатывается</option>
              <option value="failed">Ошибка</option>
              <option value="pending">Ожидает</option>
              <option value="cancelled">Отменен</option>
              <option value="refunded">Возвращен</option>
            </select>
          </div>

          {/* Фильтр по дате */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">Все время</option>
              <option value="today">Сегодня</option>
              <option value="week">Последние 7 дней</option>
              <option value="month">Последние 30 дней</option>
            </select>
          </div>

          {/* Кнопка сброса */}
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </Card>

      {/* Список платежей */}
      {filteredPayments.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {payments.length === 0 ? 'Платежей пока нет' : 'Ничего не найдено'}
          </h3>
          <p className="text-gray-600">
            {payments.length === 0 
              ? 'Когда вы оплатите бронирование, оно появится здесь'
              : 'Попробуйте изменить фильтры поиска'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              booking={bookings[payment.booking_id]}
              onRefund={handleRefund}
              onDownloadReceipt={handleDownloadReceipt}
            />
          ))}
        </div>
      )}

      {/* Пагинация (если нужна) */}
      {filteredPayments.length > 10 && (
        <div className="flex justify-center">
          <Button variant="ghost">
            Показать еще
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 
 