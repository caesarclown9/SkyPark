'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Clock
} from 'lucide-react';
import { type DashboardStats } from '@/services/adminService';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  // Добавим проверки и значения по умолчанию
  const safeStats = {
    total_revenue: stats?.total_revenue || 0,
    total_visitors: stats?.total_visitors || 0,
    total_bookings: stats?.total_bookings || 0,
    revenue_trend: stats?.revenue_trend || 0,
    visitors_trend: stats?.visitors_trend || 0,
    bookings_trend: stats?.bookings_trend || 0,
  };

  // Вычисляем средний чек
  const averageOrderValue = safeStats.total_bookings > 0 
    ? Math.round(safeStats.total_revenue / safeStats.total_bookings)
    : 0;

  const statsData = [
    {
      title: 'Общий доход',
      value: `${safeStats.total_revenue.toLocaleString()} сом`,
      change: `${safeStats.revenue_trend > 0 ? '+' : ''}${safeStats.revenue_trend.toFixed(1)}%`,
      changeType: safeStats.revenue_trend >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      bgColor: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      description: 'За текущий месяц'
    },
    {
      title: 'Посетители',
      value: safeStats.total_visitors.toLocaleString(),
      change: `${safeStats.visitors_trend > 0 ? '+' : ''}${safeStats.visitors_trend.toFixed(1)}%`,
      changeType: safeStats.visitors_trend >= 0 ? 'positive' as const : 'negative' as const,
      icon: Users,
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      description: 'Всего за период'
    },
    {
      title: 'Бронирования',
      value: safeStats.total_bookings.toLocaleString(),
      change: `${safeStats.bookings_trend > 0 ? '+' : ''}${safeStats.bookings_trend.toFixed(1)}%`,
      changeType: safeStats.bookings_trend >= 0 ? 'positive' as const : 'negative' as const,
      icon: Calendar,
      bgColor: 'from-purple-500/20 to-violet-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      description: 'Активных броней'
    },
    {
      title: 'Средний чек',
      value: `${averageOrderValue.toLocaleString()} сом`,
      change: `${safeStats.revenue_trend > 0 ? '+' : ''}${(safeStats.revenue_trend - safeStats.bookings_trend).toFixed(1)}%`,
      changeType: (safeStats.revenue_trend - safeStats.bookings_trend) >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      bgColor: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      description: 'За бронирование'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const ChangeIcon = stat.changeType === 'positive' ? ArrowUpRight : ArrowDownRight;
        
        return (
          <Card 
            key={stat.title}
            className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} hover:border-opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/20 p-6 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 group-hover:bg-slate-700/60 transition-colors duration-300`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <ChangeIcon className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-white group-hover:text-slate-100 transition-colors duration-300">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {stat.description}
              </p>
            </div>

            {/* Animated progress bar */}
            <div className="mt-4 relative">
              <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                <div 
                  className={`h-1.5 bg-gradient-to-r ${stat.bgColor.replace('/20', '/60')} rounded-full transition-all duration-1000 delay-${index * 200}`}
                  style={{ width: `${Math.min(Math.abs(parseFloat(stat.change)), 100)}%` }}
                ></div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards; 