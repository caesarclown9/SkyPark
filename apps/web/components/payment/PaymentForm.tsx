'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Banknote, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { paymentService, type PaymentMethod, type Payment } from '@/services/paymentService';
import { bookingService, type Booking } from '@/services/bookingService';

interface PaymentFormProps {
  booking: Booking;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ booking, onSuccess, onCancel }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [cardData, setCardData] = useState({
    number: '', expiry_month: '', expiry_year: '', cvv: '', holder_name: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const methods = await paymentService.getPaymentMethods();
    setPaymentMethods(methods);
    setSelectedMethod(methods[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;

    try {
      setProcessing(true);
      const payment = await paymentService.createPayment({
        booking_id: booking.id,
        amount: booking.total_cost,
        currency: 'KGS',
        provider: selectedMethod.provider,
        payment_method_id: selectedMethod.id,
      });

      setTimeout(async () => {
        const updatedPayment = await paymentService.getPaymentStatus(payment.id);
        onSuccess(updatedPayment);
      }, 3000);
    } catch (error) {
      setErrors({ submit: 'Ошибка обработки платежа' });
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = booking.total_cost;
  const selectedFee = selectedMethod ? paymentService.calculateFee(totalAmount, selectedMethod.provider) : 0;
  const finalAmount = totalAmount + selectedFee;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Оплата бронирования</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Информация о заказе */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <h3 className="font-medium text-sky-900 mb-2">Детали заказа</h3>
            <div className="space-y-1 text-sm text-sky-800">
              <div className="flex justify-between">
                <span>Парк:</span>
                <span>{booking.park?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Дата:</span>
                <span>{new Date(booking.booking_date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span>Посетители:</span>
                <span>{booking.adult_count} взрослых + {booking.child_count} детей</span>
              </div>
            </div>
          </div>

          {/* Способы оплаты */}
          <div>
            <Label className="text-base font-medium mb-3 block">Способ оплаты</Label>
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedMethod?.id === method.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      Комиссия: {method.fee_percentage}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Форма карты для банковских платежей */}
          {selectedMethod && ['mbank', 'elcart', 'optimabank'].includes(selectedMethod.provider) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-sky-600" />
                Данные банковской карты
              </h3>
              
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Месяц"
                  type="number"
                  min="1"
                  max="12"
                  value={cardData.expiry_month}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry_month: e.target.value }))}
                />
                <Input
                  placeholder="Год"
                  type="number"
                  min={new Date().getFullYear()}
                  value={cardData.expiry_year}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry_year: e.target.value }))}
                />
                <Input
                  placeholder="CVV"
                  type="password"
                  maxLength={4}
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                />
              </div>
              
              <Input
                placeholder="Имя держателя карты"
                value={cardData.holder_name}
                onChange={(e) => setCardData(prev => ({ ...prev, holder_name: e.target.value }))}
              />
            </div>
          )}

          {/* Форма для O!Деньги */}
          {selectedMethod && selectedMethod.provider === 'odengi' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-sky-600" />
                Кошелек O!Деньги
              </h3>
              <Input
                placeholder="+996 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          {/* Наличная оплата */}
          {selectedMethod && selectedMethod.provider === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Banknote className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">Оплата наличными</h3>
                  <p className="text-sm text-yellow-800">
                    Оплатите при входе в парк. Бронирование подтверждено.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Итого */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Стоимость:</span>
                <span>{paymentService.formatAmount(totalAmount)}</span>
              </div>
              {selectedFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Комиссия:</span>
                  <span>{paymentService.formatAmount(selectedFee)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>К оплате:</span>
                <span>{paymentService.formatAmount(finalAmount)}</span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex space-x-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={processing}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              disabled={processing || !selectedMethod}
              className="flex-1 bg-sky-600 hover:bg-sky-700"
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Обработка...
                </div>
              ) : (
                `Оплатить ${paymentService.formatAmount(finalAmount)}`
              )}
            </Button>
          </div>
        </form>

        {/* Безопасность */}
        <div className="mt-6 pt-6 border-t text-center">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            <span>Ваши данные защищены SSL-шифрованием</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentForm; 
 