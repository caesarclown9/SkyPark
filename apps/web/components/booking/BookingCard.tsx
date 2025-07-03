'use client';

import React from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { bookingService, type Booking } from '@/services/bookingService';

interface BookingCardProps {
  booking: Booking;
  onView?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onView,
  onEdit,
  onCancel,
  showActions = true,
}) => {
  const isModifiable = bookingService.isBookingModifiable(booking);
  const isCancellable = bookingService.isBookingCancellable(booking);
  const statusColor = bookingService.getStatusColor(booking.status);

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

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {booking.park?.name || 'Детский парк'}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{booking.park?.address?.street}, {booking.park?.address?.city}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
            {bookingService.formatBookingStatus(booking.status)}
          </span>
          
          {showActions && (
            <div className="relative group">
              <Button variant="ghost" size="sm" className="p-1">
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {onView && (
                  <button
                    onClick={() => onView(booking)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Просмотр
                  </button>
                )}
                
                {onEdit && isModifiable && (
                  <button
                    onClick={() => onEdit(booking)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Редактировать
                  </button>
                )}
                
                {onCancel && isCancellable && (
                  <button
                    onClick={() => onCancel(booking)}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-sky-600" />
            <span className="font-medium">
              {formatDate(booking.booking_date)}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-sky-600" />
            <span>
              {bookingService.formatTimeSlot(booking.time_slot)}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-2 text-sky-600" />
            <span>
              {booking.adult_count} взрослых, {booking.child_count} детей
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-sky-600" />
            <span>{booking.contact_phone}</span>
          </div>

          {booking.contact_email && (
            <div className="flex items-center text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-sky-600" />
              <span className="truncate">{booking.contact_email}</span>
            </div>
          )}

          <div className="text-right">
            <div className="text-lg font-bold text-sky-600">
              {booking.total_cost} сом
            </div>
            <div className="text-xs text-gray-500">
              Создано {formatTime(booking.created_at)} {formatDate(booking.created_at)}
            </div>
          </div>
        </div>
      </div>

      {booking.special_requests && (
        <div className="border-t pt-3">
          <div className="flex items-start text-gray-600">
            <MessageCircle className="w-4 h-4 mr-2 mt-0.5 text-sky-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Особые пожелания
              </div>
              <p className="text-sm leading-relaxed">{booking.special_requests}</p>
            </div>
          </div>
        </div>
      )}

      {(booking.confirmed_at || booking.cancelled_at) && (
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            {booking.confirmed_at && (
              <span>
                Подтверждено: {formatTime(booking.confirmed_at)} {formatDate(booking.confirmed_at)}
              </span>
            )}
            
            {booking.cancelled_at && (
              <span>
                Отменено: {formatTime(booking.cancelled_at)} {formatDate(booking.cancelled_at)}
              </span>
            )}
          </div>
        </div>
      )}

      {booking.age_groups && booking.age_groups.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Возрастные группы
          </div>
          <div className="flex flex-wrap gap-1">
            {booking.age_groups.map((age, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full"
              >
                {age} лет
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые действия для мобильных */}
      {showActions && (
        <div className="mt-4 pt-3 border-t md:hidden">
          <div className="flex space-x-2">
            {onView && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView(booking)}
                className="flex-1"
              >
                Просмотр
              </Button>
            )}
            
            {onEdit && isModifiable && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(booking)}
                className="flex-1"
              >
                Изменить
              </Button>
            )}
            
            {onCancel && isCancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(booking)}
                className="flex-1"
              >
                Отменить
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookingCard; 
 