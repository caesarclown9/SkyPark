'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Building2,
  Ticket,
  Settings,
  LogOut,
  RefreshCw,
  Download,
  Shield,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService, type DashboardStats, type AdminUser } from '@/services/adminService';
import StatsCards from './StatsCards';
import RevenueChart from './RevenueChart';
import BookingManagement from './BookingManagement';
import UserManagement from './UserManagement';
import ParkManagement from './ParkManagement';

interface AdminDashboardProps {
  adminUser?: AdminUser;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await adminService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExport = async (type: 'bookings' | 'revenue' | 'users') => {
    try {
      const blob = await adminService.exportReport(type, 'xlsx');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-slate-600 rounded-full animate-spin border-t-blue-500"></div>
            <Shield className="w-8 h-8 text-blue-400 absolute top-4 left-4" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Загрузка админ-панели</h2>
          <p className="text-slate-400">Подготовка данных системы управления...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Заголовок админ-панели */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse m-0.5"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sky Park</h1>
                <p className="text-sm text-slate-400 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  Административная панель v2.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              
              {/* System Status */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">Система онлайн</span>
              </div>
              
              {adminUser && (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-white">
                      {adminUser.first_name} {adminUser.last_name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      {adminUser.role}
                    </p>
                  </div>
                  {onLogout && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLogout}
                      className="text-slate-400 hover:text-white hover:bg-red-500/10 border border-slate-600 hover:border-red-500/30"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-2">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full bg-transparent gap-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Обзор</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Бронирования</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Пользователи</span>
              </TabsTrigger>
              <TabsTrigger 
                value="parks"
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <Building2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Парки</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tickets"
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <Ticket className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Билеты</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="flex items-center justify-center px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Настройки</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Заголовок секции */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Обзор системы</h2>
                  <p className="text-slate-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Последнее обновление: {new Date().toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleExport('revenue')}
                    className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт отчета
                  </Button>
                </div>
              </div>

              {/* Карточки статистики */}
              {dashboardStats && <StatsCards stats={dashboardStats} />}
              
              {/* График доходов */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Динамика доходов
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Текущий месяц</span>
                  </div>
                </div>
                <RevenueChart />
              </div>
              
              {/* Топ парки и популярные времена */}
              {dashboardStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Топ парки */}
                  <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-green-400" />
                        Топ парки по доходам
                      </h3>
                      <Button
                        onClick={() => handleExport('revenue')}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {dashboardStats.top_parks.map((park, index) => (
                        <div key={park.park_id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex items-center space-x-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              index === 1 ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                              index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-slate-600/50 text-slate-300 border border-slate-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{park.park_name}</p>
                              <p className="text-sm text-slate-400">
                                {park.bookings} броней • {park.visitors} посетителей
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">{park.revenue.toLocaleString()} сом</p>
                            <p className="text-xs text-slate-500">за месяц</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Системные уведомления */}
                  <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-amber-400" />
                        Системные уведомления
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-green-300 font-medium">Система работает стабильно</p>
                            <p className="text-green-400/80 text-sm">Все сервисы онлайн • Uptime: 99.9%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-blue-300 font-medium">Обновление запланировано</p>
                            <p className="text-blue-400/80 text-sm">Плановое обслуживание: завтра в 02:00</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-amber-300 font-medium">Высокая нагрузка</p>
                            <p className="text-amber-400/80 text-sm">Пиковое время использования системы</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <BookingManagement />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="parks">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <ParkManagement />
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Управление билетами</h3>
                <p className="text-slate-400 mb-6">Раздел в разработке</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Перейти к бронированиям
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Настройки системы</h3>
                <p className="text-slate-400 mb-6">Конфигурация и параметры</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Открыть настройки
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard; 