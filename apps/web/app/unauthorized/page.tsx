'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout } = useAuthStore();

  const handleGoBack = () => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin');
    } else if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            У вас недостаточно прав для доступа к этой странице. 
            Обратитесь к администратору, если считаете, что это ошибка.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleGoBack}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться назад
            </Button>

            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg"
              >
                Выйти из аккаунта
              </Button>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              <span>Система безопасности Sky Park</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 