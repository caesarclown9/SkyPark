'use client';

import React, { useState, useMemo } from 'react';
import { Ticket, Search, Filter, QrCode, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyStates } from '@/components/ui/EmptyState';
import { useAsyncData, useDebounce } from '@/hooks';
import TicketCard from './TicketCard';
import { ticketService, type Ticket as TicketType } from '@/services/ticketService';
import { TICKET_STATUSES, type TicketStatus } from '@/lib/types';
import { logApiError, logUserAction } from '@/lib/logger';

const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: tickets, loading, error, refetch } = useAsyncData(
    () => ticketService.getUserTickets(),
    { dependencies: [] }
  );

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    
    return tickets.filter(ticket => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          ticket.ticket_number.toLowerCase().includes(searchLower) ||
          ticket.holder_name.toLowerCase().includes(searchLower) ||
          ticket.validation_code.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [tickets, statusFilter, debouncedSearchTerm]);

  const handleShare = (ticket: TicketType) => {
    logUserAction('share_ticket', { ticket_id: ticket.id });
    
    if (navigator.share) {
      navigator.share({
        title: `Билет Sky Park #${ticket.ticket_number}`,
        text: `Билет на посещение Sky Park ${new Date(ticket.visit_date).toLocaleDateString('ru-RU')}`,
        url: window.location.href,
      });
    }
  };

  const handleDownload = (ticket: TicketType) => {
    logUserAction('download_ticket', { ticket_id: ticket.id });
    ticketService.downloadTicketAsImage(ticket.id);
  };

  if (loading) {
    return <LoadingSpinner text="Загружаем ваши билеты..." />;
  }

  if (error) {
    return (
      <EmptyStates.Error
        action={{
          label: 'Попробовать снова',
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
              <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Ticket className="w-6 h-6 text-sky-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои билеты</h2>
        </div>
        <div className="text-sm text-gray-600">
          Всего: {tickets?.length || 0} билетов
        </div>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Поиск */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по номеру билета..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Фильтр статуса */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">Все билеты</option>
            <option value={TICKET_STATUSES.ACTIVE}>Активные</option>
            <option value={TICKET_STATUSES.USED}>Использованные</option>
            <option value={TICKET_STATUSES.EXPIRED}>Просроченные</option>
            <option value={TICKET_STATUSES.CANCELLED}>Отмененные</option>
          </select>

          {/* Режим просмотра */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'cards' 
                  ? 'bg-sky-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Карточки
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 text-sm border-l ${
                viewMode === 'compact' 
                  ? 'bg-sky-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Компактно
            </button>
          </div>
        </div>
      </Card>

      {/* Список билетов */}
      {filteredTickets.length === 0 ? (
        tickets?.length === 0 ? (
          <EmptyStates.NoTickets
            action={{
              label: 'Забронировать билет',
              onClick: () => {
                logUserAction('click_book_ticket_from_empty_state');
                // Навигация к бронированию
              },
            }}
          />
        ) : (
          <EmptyStates.NoSearchResults
            action={{
              label: 'Очистить фильтры',
              onClick: () => {
                setSearchTerm('');
                setStatusFilter('all');
              },
              variant: 'outline',
            }}
          />
        )
      ) : (
        <div className={viewMode === 'compact' ? 'space-y-3' : 'space-y-6'}>
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              compact={viewMode === 'compact'}
              onShare={handleShare}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList; 
 