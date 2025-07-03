'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Calendar, MapPin, Clock, Users, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { paymentService, type Payment } from '@/services/paymentService';
import { bookingService, type Booking } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';

interface PaymentSuccessProps {
  payment: Payment;
  booking: Booking;
  onClose?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ payment, booking, onClose }) => {
  const [ticketsGenerated, setTicketsGenerated] = useState(false);

  useEffect(() => {
    // Генерируем билеты после успешной оплаты
    if (payment.status === 'completed' && !ticketsGenerated) {
      generateTickets();
    }
  }, [payment.status, ticketsGenerated]);

  const generateTickets = async () => {
    try {
      await ticketService.generateTicketsFromBooking(booking.id, payment.id);
      setTicketsGenerated(true);
    } catch (error) {
      console.error('Ошибка генерации билетов:', error);
    }
  };
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadReceipt = () => {
    // В реальном приложении здесь будет генерация PDF чека
    const receiptData = {
      payment_id: payment.id,
      booking_id: booking.id,
      amount: payment.amount,
      date: payment.created_at,
      park: booking.park?.name,
      visit_date: booking.booking_date,
      time_slot: booking.time_slot,
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${payment.id.slice(0, 8)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getProviderName = (provider: string): string => {
    const providers: Record<string, string> = {
      mbank: 'mBank',
      odengi: 'O!Деньги',
      elcart: 'ЭлКарт',
      optimabank: 'Optima Bank',
      cash: 'Наличные',
    };
    return providers[provider] || provider;
  };

  const isPaymentCompleted = payment.status === 'completed';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        {/* Статус оплаты */}
        <div className="text-center mb-8">
          {isPaymentCompleted ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Оплата прошла успешно!
              </h2>
              <p className="text-gray-600">
                Ваше бронирование подтверждено и оплачено
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                Платеж обрабатывается
              </h2>
              <p className="text-gray-600">
                Мы обрабатываем ваш платеж, это займет несколько минут
              </p>
            </>
          )}
        </div>

        {/* Детали платежа */}
        <div className="space-y-6">
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-sky-600" />
              Детали платежа
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Номер платежа:</span>
                <div className="font-mono font-medium">#{payment.id.slice(0, 8)}</div>
              </div>
              <div>
                <span className="text-gray-600">Способ оплаты:</span>
                <div className="font-medium">{getProviderName(payment.provider)}</div>
              </div>
              <div>
                <span className="text-gray-600">Сумма:</span>
                <div className="font-medium">{paymentService.formatAmount(payment.amount)}</div>
              </div>
              <div>
                <span className="text-gray-600">Статус:</span>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${paymentService.getStatusColor(payment.status)}`}>
                  {paymentService.formatPaymentStatus(payment.status)}
                </div>
              </div>
              {payment.fee_amount > 0 && (
                <div>
                  <span className="text-gray-600">Комиссия:</span>
                  <div className="font-medium">{paymentService.formatAmount(payment.fee_amount)}</div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Дата:</span>
                <div className="font-medium">
                  {formatTime(payment.created_at)} {formatDate(payment.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Детали бронирования */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <h3 className="font-medium text-sky-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-sky-600" />
              Детали посещения
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sky-800">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-medium">{booking.park?.name}</span>
              </div>
              <div className="flex items-center text-sky-800">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(booking.booking_date)}</span>
              </div>
              <div className="flex items-center text-sky-800">
                <Clock className="w-4 h-4 mr-2" />
                <span>{bookingService.formatTimeSlot(booking.time_slot)}</span>
              </div>
              <div className="flex items-center text-sky-800">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.adult_count} взрослых + {booking.child_count} детей</span>
              </div>
            </div>
          </div>

          {/* Важная информация */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Важная информация</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Пожалуйста, приходите за 15 минут до начала сеанса</p>
              <p>• При себе иметь документ, удостоверяющий личность</p>
              <p>• Дети до 12 лет должны быть в сопровождении взрослых</p>
              <p>• В случае опоздания более чем на 30 минут, бронирование аннулируется</p>
            </div>
          </div>

          {/* Контакты парка */}
          {booking.park?.phone_number && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                Вопросы? Свяжитесь с парком:
              </p>
              <a
                href={`tel:${booking.park.phone_number}`}
                className="text-sky-600 font-medium hover:text-sky-700"
              >
                {booking.park.phone_number}
              </a>
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              onClick={handleDownloadReceipt}
              variant="secondary"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать чек
            </Button>

            <Button
              asChild
              className="flex-1 bg-sky-600 hover:bg-sky-700"
            >
              <Link href="/dashboard?tab=tickets">
                Мои билеты
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* SMS уведомление */}
          {isPaymentCompleted && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              📱 SMS с деталями бронирования отправлено на номер {booking.contact_phone}
            </div>
          )}

          {onClose && (
            <div className="text-center pt-4">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 
 