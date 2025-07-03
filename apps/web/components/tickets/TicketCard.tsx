'use client';

import React, { useState } from 'react';
import { QrCode, Download, Share2, Calendar, Clock, MapPin, User, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ticketService, type Ticket } from '@/services/ticketService';
import QRCodeGenerator from './QRCodeGenerator';

interface TicketCardProps {
  ticket: Ticket;
  showQR?: boolean;
  compact?: boolean;
  onShare?: (ticket: Ticket) => void;
  onDownload?: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  showQR = true, 
  compact = false,
  onShare,
  onDownload 
}) => {
  const [showFullQR, setShowFullQR] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(ticket);
    } else {
      ticketService.downloadTicketAsImage(ticket.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(ticket);
    } else {
      // Дефолтное поведение - поделиться через Web Share API
      if (navigator.share) {
        navigator.share({
          title: `Билет Sky Park #${ticket.ticket_number}`,
          text: `Билет на посещение Sky Park ${formatDate(ticket.visit_date)}`,
          url: window.location.href,
        });
      } else {
        // Fallback - копирование в буфер обмена
        navigator.clipboard.writeText(
          `Билет Sky Park #${ticket.ticket_number} на ${formatDate(ticket.visit_date)}`
        );
        alert('Информация о билете скопирована в буфер обмена');
      }
    }
  };

  const isValid = ticketService.isTicketValid(ticket);
  const timeUntilExpiry = ticketService.getTimeUntilExpiry(ticket);

  // Компактная версия карточки
  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          {/* QR код */}
          {showQR && (
            <div className="flex-shrink-0">
              <QRCodeGenerator
                value={ticket.qr_data}
                size={60}
                className="rounded"
              />
            </div>
          )}

          {/* Основная информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">
                {ticketService.getTicketTypeIcon(ticket.ticket_type)}
              </span>
              <span className="font-bold text-gray-900">#{ticket.ticket_number}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${ticketService.getStatusColor(ticket.status)}`}>
                {ticketService.formatTicketStatus(ticket.status)}
              </span>
            </div>
            
            <p className="font-medium text-gray-900 truncate">{ticket.holder_name}</p>
            <p className="text-sm text-gray-600">
              {formatDate(ticket.visit_date)} • {ticketService.formatTimeSlot(ticket.time_slot)}
            </p>
          </div>

          {/* Действия */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => setShowFullQR(true)}
              variant="ghost"
              size="sm"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Полная версия карточки билета
  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-sky-50 to-white border-sky-200">
        {/* Заголовок билета */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎡</span>
                <h3 className="text-xl font-bold">Sky Park</h3>
              </div>
              <p className="text-sky-100">Детский развлекательный центр</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">#{ticket.ticket_number}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border-2 ${
                isValid 
                  ? 'border-green-300 bg-green-100 text-green-800' 
                  : 'border-red-300 bg-red-100 text-red-800'
              }`}>
                {ticketService.formatTicketStatus(ticket.status)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Левая колонка */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-sm text-gray-600">Владелец билета</div>
                  <div className="font-bold text-gray-900">{ticket.holder_name}</div>
                  {ticket.holder_age && (
                    <div className="text-sm text-gray-500">{ticket.holder_age} лет</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-sm text-gray-600">Дата посещения</div>
                  <div className="font-bold text-gray-900">{formatDate(ticket.visit_date)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-sm text-gray-600">Время</div>
                  <div className="font-bold text-gray-900">
                    {ticketService.formatTimeSlot(ticket.time_slot)}
                  </div>
                </div>
              </div>

              {ticket.gate_number && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">Вход</div>
                    <div className="font-bold text-gray-900">Ворота {ticket.gate_number}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка - QR код */}
            {showQR && (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                  <QRCodeGenerator
                    value={ticket.qr_data}
                    size={140}
                    className="rounded"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Покажите QR-код на входе
                </p>
              </div>
            )}
          </div>

          {/* Тип билета и цена */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {ticketService.getTicketTypeIcon(ticket.ticket_type)}
                </span>
                <div>
                  <div className="font-medium text-gray-900">
                    {ticketService.getTicketTypeName(ticket.ticket_type)} билет
                  </div>
                  <div className="text-sm text-gray-600">
                    {ticket.discount_amount > 0 ? (
                      <>
                        <span className="line-through">{ticket.original_price} сом</span>
                        <span className="ml-2 text-green-600">
                          -{ticket.discount_amount} сом
                        </span>
                      </>
                    ) : (
                      `${ticket.original_price} сом`
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-600">
                  {ticket.paid_price} сом
                </div>
                {ticket.discount_reason && (
                  <div className="text-xs text-green-600">{ticket.discount_reason}</div>
                )}
              </div>
            </div>
          </div>

          {/* Дополнительные услуги */}
          {(ticket.meal_included || ticket.parking_included || ticket.special_needs) && (
            <div className="border-t pt-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Дополнительные услуги</h4>
              <div className="space-y-1">
                {ticket.meal_included && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🍕</span>
                    Питание включено
                  </div>
                )}
                {ticket.parking_included && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🚗</span>
                    Парковка включена
                  </div>
                )}
                {ticket.special_needs && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">♿</span>
                    {ticket.special_needs}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Статус и валидность */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Статус билета
                  </div>
                  <div className="text-sm text-gray-600">
                    {isValid ? (
                      <span className="text-green-600">
                        ✅ Действителен до {timeUntilExpiry}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ❌ {ticketService.formatTicketStatus(ticket.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {ticket.used_at && (
                <div className="text-right text-sm text-gray-600">
                  <div>Использован:</div>
                  <div>{formatTime(ticket.used_at)}</div>
                  {ticket.used_gate && <div>Вход: {ticket.used_gate}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowFullQR(true)}
              className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR-код
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать
            </Button>
            
            <Button
              onClick={handleShare}
              variant="ghost"
              className="flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          </div>

          {/* Информация безопасности */}
          <div className="mt-6 pt-4 border-t text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Код валидации: {ticket.validation_code}</div>
              <div>Выдан: {ticketService.formatDateTime(ticket.issued_at)}</div>
              <div className="flex items-center justify-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Защищено криптографической подписью</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Модальное окно с большим QR-кодом */}
      {showFullQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                QR-код билета
              </h3>
              <p className="text-gray-600">
                Покажите этот код на входе в парк
              </p>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCodeGenerator
                  value={ticket.qr_data}
                  size={200}
                  className="rounded"
                />
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 mb-6">
              <div className="font-medium">#{ticket.ticket_number}</div>
              <div>{ticket.holder_name}</div>
              <div>{formatDate(ticket.visit_date)}</div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowFullQR(false)}
                variant="secondary"
                className="flex-1"
              >
                Закрыть
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-sky-600 hover:bg-sky-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCard; 
 