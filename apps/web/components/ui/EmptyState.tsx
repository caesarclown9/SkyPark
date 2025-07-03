'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { BaseComponentProps } from '@/lib/types';

interface EmptyStateProps extends BaseComponentProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  compact = false,
  className = '',
}) => {
  const content = (
    <div className={`text-center ${compact ? 'space-y-3' : 'space-y-4'} ${className}`}>
      {/* Иконка или эмодзи */}
      <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} mx-auto flex items-center justify-center`}>
        {emoji ? (
          <span className={`${compact ? 'text-4xl' : 'text-6xl'}`}>{emoji}</span>
        ) : Icon ? (
          <Icon className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400`} />
        ) : (
          <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-100 rounded-full`} />
        )}
      </div>

      {/* Текст */}
      <div className="space-y-2">
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
          {title}
        </h3>
        {description && (
          <p className={`${compact ? 'text-sm' : 'text-base'} text-gray-600 max-w-sm mx-auto`}>
            {description}
          </p>
        )}
      </div>

      {/* Действие */}
      {action && (
        <div className={compact ? 'pt-2' : 'pt-4'}>
          <Button
            variant={action.variant || 'default'}
            onClick={action.onClick}
            size={compact ? 'sm' : 'default'}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className="p-8">
      {content}
    </Card>
  );
};

// Предустановленные empty states для типичных случаев
export const EmptyStates = {
  NoTickets: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="🎫"
      title="У вас пока нет билетов"
      description="Забронируйте посещение, чтобы получить билеты"
      {...props}
    />
  ),

  NoBookings: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="📅"
      title="У вас пока нет бронирований"
      description="Выберите парк и забронируйте время для веселья"
      {...props}
    />
  ),

  NoNotifications: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="🔔"
      title="Нет новых уведомлений"
      description="Мы сообщим вам о важных событиях"
      {...props}
    />
  ),

  NoParks: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="🎠"
      title="Парки не найдены"
      description="Попробуйте изменить параметры поиска"
      {...props}
    />
  ),

  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="🔍"
      title="Ничего не найдено"
      description="Попробуйте изменить запрос или фильтры"
      {...props}
    />
  ),

  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      emoji="⚠️"
      title="Что-то пошло не так"
      description="Произошла ошибка при загрузке данных"
      {...props}
    />
  ),
}; 