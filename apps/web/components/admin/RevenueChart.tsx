'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

const RevenueChart: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">График доходов</h3>
          <p className="text-sm text-gray-600">Динамика доходов за последние 30 дней</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+12.5%</span>
        </div>
      </div>

      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">График загружается...</p>
        </div>
      </div>
    </Card>
  );
};

export default RevenueChart; 