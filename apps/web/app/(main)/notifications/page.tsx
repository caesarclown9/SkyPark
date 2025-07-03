'use client';

import { Suspense } from 'react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import PageWrapper from '@/components/layout/PageWrapper';
import { Bell, Mail, MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  // Header content с быстрыми действиями
  const headerContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
      <div className="skypark-card-compact text-center">
        <Bell className="w-8 h-8 text-purple-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Все уведомления</h3>
        <p className="text-sm text-gray-600">Центр сообщений</p>
      </div>
      
      <div className="skypark-card-compact text-center">
        <MessageCircle className="w-8 h-8 text-pink-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Важные новости</h3>
        <p className="text-sm text-gray-600">Акции и события</p>
      </div>
      
      <div className="skypark-card-compact text-center">
        <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Бронирования</h3>
        <p className="text-sm text-gray-600">Статус билетов</p>
      </div>
      
      <div className="skypark-card-compact text-center">
        <Link href="/settings/notifications" className="block">
          <Settings className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Настройки</h3>
          <p className="text-sm text-gray-600">Управление</p>
        </Link>
      </div>
    </div>
  );

  return (
    <PageWrapper
      title="Центр уведомлений"
      subtitle="🔔 Все новости, акции и обновления от Sky Park в одном месте"
      headerContent={headerContent}
    >
      <div className="skypark-card">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="skypark-loading-large mb-6"></div>
              <p className="text-purple-600 font-medium">Загружаем ваши уведомления...</p>
            </div>
          </div>
        }>
          <NotificationCenter />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

 