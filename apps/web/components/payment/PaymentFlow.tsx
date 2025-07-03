'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import PaymentForm from './PaymentForm';
import PaymentSuccess from './PaymentSuccess';
import { bookingService, type Booking } from '@/services/bookingService';
import { type Payment } from '@/services/paymentService';

interface PaymentFlowProps {
  bookingId: string;
  parkId: string;
}

type FlowStep = 'loading' | 'payment' | 'success' | 'error';

const PaymentFlow: React.FC<PaymentFlowProps> = ({ bookingId, parkId }) => {
  const [step, setStep] = useState<FlowStep>('loading');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const bookingData = await bookingService.getBookingById(bookingId);
      setBooking(bookingData);
      setStep('payment');
    } catch (error) {
      console.error('Ошибка загрузки бронирования:', error);
      setError('Не удалось загрузить бронирование');
      setStep('error');
    }
  };

  const handlePaymentSuccess = (paymentData: Payment) => {
    setPayment(paymentData);
    setStep('success');
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Загрузка данных бронирования...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/parks/${parkId}`}>Вернуться к парку</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/parks">Все парки</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Заголовок */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/parks/${parkId}/book`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Link>
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {step === 'payment' && 'Оплата бронирования'}
                  {step === 'success' && 'Оплата завершена'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'payment' && booking && (
          <PaymentForm
            booking={booking}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        )}
        
        {step === 'success' && booking && payment && (
          <PaymentSuccess
            booking={booking}
            payment={payment}
            onClose={() => {
              window.location.href = '/dashboard?tab=bookings';
            }}
          />
        )}
      </div>
    </>
  );
};

export default PaymentFlow; 
 