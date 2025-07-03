'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, adminUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/admin');
      return;
    }

    if (!isLoading && isAuthenticated && isAdmin && adminUser && !adminUser.is_active) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isAdmin, adminUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-600 rounded-full animate-spin border-t-blue-500 mb-6"></div>
            <Shield className="w-6 h-6 text-blue-400 absolute top-3 left-3" />
          </div>
          <p className="text-slate-300 font-medium">Проверка доступа администратора...</p>
          <p className="text-slate-500 text-sm mt-1">Система безопасности Sky Park</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (adminUser && !adminUser.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Доступ заблокирован</h1>
          <p className="text-slate-300 mb-6 max-w-md">
            Ваша учетная запись администратора деактивирована. 
            Обратитесь к системному администратору для восстановления доступа.
          </p>
          <button
            onClick={() => router.push('/auth/admin')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 
 