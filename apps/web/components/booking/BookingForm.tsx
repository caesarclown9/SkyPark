'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { bookingService, type BookingRequest, type TimeSlot, type Park } from '@/services/bookingService';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  park: Park;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ park, onSuccess, onCancel }) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    adultCount: 1,
    childCount: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: '',
    ageGroups: [] as string[],
    preferredLanguage: 'ru',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Получаем временные слоты при выборе даты
  useEffect(() => {
    if (selectedDate && park.id) {
      loadTimeSlots();
    }
  }, [selectedDate, park.id]);

  const loadTimeSlots = async () => {
    try {
      setLoadingTimeSlots(true);
      const data = await bookingService.getAvailableTimeSlots(park.id, selectedDate);
      setTimeSlots(data.time_slots);
    } catch (error) {
      console.error('Ошибка загрузки временных слотов:', error);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(''); // Сброс выбранного времени при смене даты
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = 'Выберите дату посещения';
    }

    if (!selectedTimeSlot) {
      newErrors.timeSlot = 'Выберите время посещения';
    }

    if (formData.adultCount + formData.childCount === 0) {
      newErrors.guests = 'Добавьте хотя бы одного посетителя';
    }

    if (formData.childCount > 0 && formData.adultCount === 0) {
      newErrors.adults = 'Дети должны быть в сопровождении взрослых';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Введите имя контактного лица';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Введите номер телефона';
    } else if (!formData.contactPhone.startsWith('+996')) {
      newErrors.contactPhone = 'Номер должен начинаться с +996';
    }

    if (formData.contactEmail && !formData.contactEmail.includes('@')) {
      newErrors.contactEmail = 'Введите корректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const booking: BookingRequest = {
        park_id: park.id,
        booking_date: selectedDate,
        time_slot: selectedTimeSlot,
        adult_count: formData.adultCount,
        child_count: formData.childCount,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail || undefined,
        special_requests: formData.specialRequests || undefined,
        age_groups: formData.ageGroups.length > 0 ? formData.ageGroups : undefined,
        preferred_language: formData.preferredLanguage,
      };

      const result = await bookingService.createBooking(booking);
      
      if (onSuccess) {
        onSuccess(result.id);
      } else {
        // Перенаправляем на страницу оплаты
        window.location.href = `/parks/${park.id}/book/payment?booking=${result.id}`;
      }
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Ошибка создания бронирования' });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = bookingService.calculateTotalCost(formData.adultCount, formData.childCount);

  // Генерируем даты на следующие 90 дней (исключая прошедшие)
  const generateAvailableDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 90; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Бронирование в {park.name}
          </h2>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{park.address?.street}, {park.address?.city}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор даты */}
          <div>
            <Label htmlFor="date" className="flex items-center text-base font-medium text-gray-700 mb-3">
              <Calendar className="w-5 h-5 mr-2 text-sky-600" />
              Дата посещения
            </Label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Выберите дату</option>
              {availableDates.map(date => {
                const dateObj = new Date(date);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                return (
                  <option key={date} value={date}>
                    {dateObj.toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} {isWeekend && '(выходной)'}
                  </option>
                );
              })}
            </select>
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Выбор времени */}
          {selectedDate && (
            <div>
              <Label className="flex items-center text-base font-medium text-gray-700 mb-3">
                <Clock className="w-5 h-5 mr-2 text-sky-600" />
                Время посещения
              </Label>
              
              {loadingTimeSlots ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                  <p className="text-gray-500 mt-2">Загрузка доступного времени...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.time_slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot.time_slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedTimeSlot === slot.time_slot
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : slot.available
                          ? 'border-gray-300 hover:border-sky-300 hover:bg-sky-50'
                          : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">
                        {bookingService.formatTimeSlot(slot.time_slot)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {slot.available ? 'Доступно' : 'Занято'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>}
            </div>
          )}

          {/* Количество посетителей */}
          <div>
            <Label className="flex items-center text-base font-medium text-gray-700 mb-3">
              <Users className="w-5 h-5 mr-2 text-sky-600" />
              Количество посетителей
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults" className="text-sm text-gray-600 mb-1">
                  Взрослые (от 18 лет)
                </Label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleInputChange('adultCount', Math.max(0, formData.adultCount - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2 font-medium">{formData.adultCount}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('adultCount', formData.adultCount + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="children" className="text-sm text-gray-600 mb-1">
                  Дети (до 18 лет)
                </Label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleInputChange('childCount', Math.max(0, formData.childCount - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2 font-medium">{formData.childCount}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('childCount', formData.childCount + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
            {errors.adults && <p className="text-red-500 text-sm mt-1">{errors.adults}</p>}
          </div>

          {/* Контактная информация */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Контактная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Имя контактного лица *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Введите ваше имя"
                  className={errors.contactName ? 'border-red-500' : ''}
                />
                {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
              </div>

              <div>
                <Label htmlFor="contactPhone">Номер телефона *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+996 XXX XXX XXX"
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="contactEmail">Email (необязательно)</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="your@email.com"
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
            </div>
          </div>

          {/* Дополнительная информация */}
          <div>
            <Label htmlFor="specialRequests" className="flex items-center text-base font-medium text-gray-700 mb-2">
              <MessageCircle className="w-5 h-5 mr-2 text-sky-600" />
              Особые пожелания (необязательно)
            </Label>
            <textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Напишите любые особые пожелания или требования..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
              rows={3}
            />
          </div>

          {/* Стоимость */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Предварительная стоимость</h4>
                <p className="text-sm text-gray-600">
                  {formData.adultCount} взрослых + {formData.childCount} детей
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-600">{totalCost} сом</div>
                <p className="text-xs text-gray-500">Окончательная стоимость может отличаться</p>
              </div>
            </div>
          </div>

          {/* Ошибка отправки */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex space-x-4 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Отмена
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Создание...
                </div>
              ) : (
                'Продолжить к оплате'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookingForm; 
 