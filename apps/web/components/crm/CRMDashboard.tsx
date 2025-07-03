'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users, TrendingUp, Phone, Mail } from 'lucide-react';

const CRMDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900">CRM Dashboard</h2>
        <p className="text-gray-600">Управление клиентскими отношениями</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего клиентов</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активные</p>
              <p className="text-2xl font-bold text-gray-900">892</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Обращения</p>
              <p className="text-2xl font-bold text-gray-900">34</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CRMDashboard; 