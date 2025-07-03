'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Plus } from 'lucide-react';

const NotificationManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Управление уведомлениями</h2>
            <p className="text-gray-600">Создание и отправка уведомлений пользователям</p>
          </div>
          <Button className="bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4 mr-2" />
            Создать уведомление
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Уведомления отсутствуют
          </h3>
          <p className="text-gray-600">
            Создайте первое уведомление для ваших пользователей
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotificationManagement; 