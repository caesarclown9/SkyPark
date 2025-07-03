'use client';

import { useState, useEffect } from 'react';
import { logApiError, logUserAction } from '@/lib/logger';
import PageWrapper from '@/components/layout/PageWrapper';
import TicketScanner from '@/components/tickets/TicketScanner';
import { useAuthStore } from '@/stores/useAuthStore';
import { QrCode, Camera, Scan, AlertCircle, CheckCircle, History } from 'lucide-react';
import Link from 'next/link';

export default function ScannerPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<{
    id: string;
    ticketId: string;
    scannedAt: Date;
    isValid: boolean;
    message: string;
  }[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
    } catch (error) {
      setPermissionGranted(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper
        title="QR Сканер"
        subtitle="🔒 Для использования сканера необходимо войти в аккаунт"
        showNavigation={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="skypark-card text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🔐 Требуется авторизация
            </h2>
            <p className="text-gray-600 mb-6">
              Сканирование QR-кодов доступно только авторизованным пользователям
            </p>
            <Link href="/auth/login">
              <button className="btn-skypark-primary px-8 py-3 text-base">
                🎈 Войти в систему
              </button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Header content с информацией о сканере
  const headerContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="skypark-card-compact text-center">
        <QrCode className="w-8 h-8 text-purple-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">QR-коды билетов</h3>
        <p className="text-sm text-gray-600">Сканируйте для входа</p>
      </div>
      
      <div className="skypark-card-compact text-center">
        <Camera className="w-8 h-8 text-pink-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Камера</h3>
        <p className="text-sm text-gray-600">Автоматическое распознавание</p>
      </div>
      
      <div className="skypark-card-compact text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Мгновенная проверка</h3>
        <p className="text-sm text-gray-600">Результат за секунды</p>
      </div>
    </div>
  );

  return (
    <PageWrapper
      title="QR Сканер билетов"
      subtitle="📱 Быстрое сканирование QR-кодов для входа в парки Sky Park"
      headerContent={headerContent}
    >
      {/* Основной сканер */}
      <div className="skypark-card mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
            📸 Сканер QR-кодов
          </h2>
          <p className="text-gray-600">
            Наведите камеру на QR-код билета для автоматического сканирования
          </p>
        </div>

        {permissionGranted === false ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              📷 Нет доступа к камере
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Для работы сканера необходимо разрешить доступ к камере в настройках браузера
            </p>
            <button 
              onClick={checkCameraPermission}
              className="btn-skypark-primary px-6 py-3"
            >
              🔄 Проверить разрешения
            </button>
          </div>
        ) : permissionGranted === null ? (
          <div className="text-center py-12">
            <div className="skypark-loading-large mb-6"></div>
            <p className="text-purple-600 font-medium">Проверяем доступ к камере...</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <TicketScanner 
              gateNumber="A1"
              onValidation={(result) => {
                logUserAction('scan_ticket_success', { ticket_id: result.ticketId, is_valid: result.isValid });
                setScanHistory(prev => [
                  { 
                    id: Date.now(), 
                    result: result.is_valid ? 'Успешная валидация' : result.error_message, 
                    timestamp: new Date(),
                    status: result.is_valid ? 'success' : 'error'
                  },
                  ...prev.slice(0, 4) // Храним последние 5 результатов
                ]);
              }}
            />
          </div>
        )}
      </div>

      {/* История сканирований */}
      {scanHistory.length > 0 && (
        <div className="skypark-card">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-skypark-gradient mb-2 flex items-center justify-center">
              <History className="w-5 h-5 mr-2" />
              📚 История сканирований
            </h3>
            <p className="text-gray-600">Последние результаты сканирования</p>
          </div>
          
          <div className="space-y-4">
            {scanHistory.map((item) => (
              <div key={item.id} className="skypark-card-compact">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'success' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {item.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.status === 'success' ? 'Успешное сканирование' : 'Ошибка сканирования'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.result || item.error}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация и инструкции */}
      <div className="skypark-card-highlight mt-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-skypark-gradient mb-4">
            💡 Как пользоваться сканером
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Разместите QR-код</h4>
              <p className="text-sm text-gray-600">
                Поместите QR-код билета в центр экрана камеры
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Автоматическое сканирование</h4>
              <p className="text-sm text-gray-600">
                Сканер автоматически распознает код и проверит билет
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Получите результат</h4>
              <p className="text-sm text-gray-600">
                Мгновенная проверка статуса билета и разрешение входа
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 