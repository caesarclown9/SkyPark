'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Star, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminService, type ParkStats } from '@/services/adminService';

const ParkManagement: React.FC = () => {
  const [parkStats, setParkStats] = useState<ParkStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParkStats();
  }, []);

  const loadParkStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getParkStats();
      setParkStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики парков:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
            <p className="text-sm text-gray-600">Загрузка статистики парков...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Управление парками</h2>
            <p className="text-gray-600">Статистика и управление развлекательными парками</p>
          </div>
          <Button className="bg-sky-600 hover:bg-sky-700">
            Добавить парк
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {parkStats.map((park) => (
          <Card key={park.park_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{park.park_name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{park.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Управление
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center text-green-600 mb-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Доход</span>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {adminService.formatCurrency(park.total_revenue)}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center text-blue-600 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Посетители</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {park.total_visitors.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Всего бронирований:</span>
                <span className="font-medium">{park.total_bookings}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Загрузка капасити:</span>
                <span className="font-medium">{park.capacity_utilization.toFixed(1)}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-sky-600 h-2 rounded-full"
                  style={{ width: `${park.capacity_utilization}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Активен
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParkManagement; 