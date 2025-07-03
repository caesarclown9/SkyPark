'use client';

import React from 'react';
import { Calendar, CreditCard, MapPin, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { paymentService, type Payment } from '@/services/paymentService';
import { bookingService, type Booking } from '@/services/bookingService';

interface PaymentCardProps {
  payment: Payment;
  booking?: Booking;
  onRefund?: (paymentId: string) => void;
  onDownloadReceipt?: (paymentId: string) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ 
  payment, 
  booking, 
  onRefund, 
  onDownloadReceipt 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProviderIcon = (provider: string): string => {
    const providers: Record<string, string> = {
      mbank: '🏦',
      odengi: '📱',
      elcart: '💳',
      optimabank: '🔷',
      cash: '💵',
    };
    return providers[provider] || '💳';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const canRefund = payment.status === 'completed' && 
                   payment.provider !== 'cash' && 
                   onRefund;

  const handleDownload = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt(payment.id);
    } else {
      // Дефолтная реализация скачивания чека
      const receiptData = {
        payment_id: payment.id,
        booking_id: payment.booking_id,
        amount: payment.amount,
        date: payment.created_at,
        provider: payment.provider,
        status: payment.status,
      };

      const dataStr = JSON.stringify(receiptData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${payment.id.slice(0, 8)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Заголовок с номером платежа и статусом */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getProviderIcon(payment.provider)}</span>
            <div>
              <h3 className="font-medium text-gray-900">
                Платеж #{payment.id.slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-600">{getProviderName(payment.provider)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(payment.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${paymentService.getStatusColor(payment.status)}`}>
              {paymentService.formatPaymentStatus(payment.status)}
            </span>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Сумма:</span>
            <div className="font-bold text-lg text-gray-900">
              {paymentService.formatAmount(payment.amount)}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Дата:</span>
            <div className="font-medium text-gray-900">
              {formatDate(payment.created_at)}
            </div>
          </div>

          {payment.fee_amount > 0 && (
            <div>
              <span className="text-gray-600">Комиссия:</span>
              <div className="font-medium text-gray-900">
                {paymentService.formatAmount(payment.fee_amount)}
              </div>
            </div>
          )}

          {payment.provider_transaction_id && (
            <div>
              <span className="text-gray-600">ID транзакции:</span>
              <div className="font-mono text-xs text-gray-700">
                {payment.provider_transaction_id}
              </div>
            </div>
          )}
        </div>

        {/* Информация о бронировании (если есть) */}
        {booking && (
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
            <div className="flex items-center text-sky-900 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="font-medium">{booking.park?.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-sky-800">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(booking.booking_date).toLocaleDateString('ru-RU')}
              </div>
              <div>
                {booking.adult_count} взр. + {booking.child_count} дет.
              </div>
            </div>
          </div>
        )}

        {/* Ошибка платежа */}
        {payment.status === 'failed' && payment.failure_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
              <div>
                <div className="text-red-900 font-medium text-sm">Ошибка платежа</div>
                <div className="text-red-700 text-sm">{payment.failure_reason}</div>
              </div>
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Download className="w-4 h-4 mr-2" />
            Скачать чек
          </Button>

          {canRefund && (
            <Button
              onClick={() => onRefund!(payment.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Вернуть
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PaymentCard; 
 