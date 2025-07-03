'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Bell } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Центр уведомлений</h2>
        <p className="text-gray-600">Все ваши уведомления в одном месте</p>
      </Card>

      <Card className="p-6">
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет новых уведомлений
              </h3>
              <p className="text-gray-600">
            Когда появятся новые уведомления, они отобразятся здесь
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotificationCenter; 