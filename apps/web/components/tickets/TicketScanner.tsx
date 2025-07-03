'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ticketService, type TicketValidation } from '@/services/ticketService';

interface TicketScannerProps {
  gateNumber?: string;
  onValidation?: (result: TicketValidation) => void;
}

const TicketScanner: React.FC<TicketScannerProps> = ({ 
  gateNumber = 'A1', 
  onValidation 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (qrData: string) => {
    try {
      setLoading(true);
      const result = await ticketService.validateTicket(qrData, gateNumber);
      setValidationResult(result);
      
      if (onValidation) {
        onValidation(result);
      }
    } catch (error) {
      console.error('Ошибка валидации:', error);
      setValidationResult({
        is_valid: false,
        validation_time: new Date().toISOString(),
        error_code: 'SCAN_ERROR',
        error_message: 'Ошибка сканирования QR-кода',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = () => {
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Здесь должна быть логика чтения QR-кода из изображения
      // Для демонстрации используем имя файла
      const mockQRData = `skypark://ticket/demo/${file.name}/300/2025-02-15T10:00:00Z`;
      handleScan(mockQRData);
    }
  };

  const startCamera = () => {
    setIsScanning(true);
    // В реальном приложении здесь будет запуск камеры
    // Для демонстрации симулируем сканирование через 3 секунды
    setTimeout(() => {
      const mockQRData = 'skypark://ticket/booking-demo/adult/300/2025-02-15T10:00:00Z';
      handleScan(mockQRData);
      setIsScanning(false);
    }, 3000);
  };

  const stopCamera = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setValidationResult(null);
    setManualCode('');
  };

  const getResultIcon = (result: TicketValidation) => {
    if (result.is_valid) {
      return <CheckCircle className="w-12 h-12 text-green-600" />;
    } else {
      return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getResultColor = (result: TicketValidation) => {
    if (result.is_valid) {
      return 'border-green-200 bg-green-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Сканер билетов
          </h2>
          <p className="text-gray-600">
            Вход: {gateNumber} • Sky Park
          </p>
        </div>

        {/* Результат валидации */}
        {validationResult && (
          <Card className={`p-6 mb-6 border-2 ${getResultColor(validationResult)}`}>
            <div className="text-center">
              {getResultIcon(validationResult)}
              
              <h3 className={`text-xl font-bold mt-4 mb-2 ${
                validationResult.is_valid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResult.is_valid ? 'Билет действителен!' : 'Билет недействителен'}
              </h3>
              
              {validationResult.is_valid && validationResult.ticket ? (
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">#{validationResult.ticket.ticket_number}</p>
                  <p>{validationResult.ticket.holder_name}</p>
                  <p className="text-sm">
                    {ticketService.getTicketTypeName(validationResult.ticket.ticket_type)} билет
                  </p>
                  <p className="text-sm text-gray-600">
                    Валидация: {new Date(validationResult.validation_time).toLocaleTimeString('ru-RU')}
                  </p>
                </div>
              ) : (
                <div className="text-red-700">
                  <p className="font-medium">{validationResult.error_message}</p>
                  {validationResult.error_code && (
                    <p className="text-sm">Код ошибки: {validationResult.error_code}</p>
                  )}
                </div>
              )}
              
              <Button
                onClick={resetScanner}
                className="mt-4"
                variant="secondary"
              >
                Сканировать следующий
              </Button>
            </div>
          </Card>
        )}

        {/* Методы сканирования */}
        {!validationResult && (
          <div className="space-y-6">
            {/* Камера */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Сканирование камерой
              </h3>
              
              {isScanning ? (
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
                  <p className="text-gray-600 mb-4">Поиск QR-кода...</p>
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 mb-4">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Наведите камеру на QR-код билета
                  </p>
                </div>
              )}
              
              <div className="flex justify-center space-x-3">
                {!isScanning ? (
                  <Button
                    onClick={startCamera}
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Включить камеру
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="secondary"
                  >
                    Остановить
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              {/* Загрузка файла */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Загрузить изображение
                </h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">
                    Выберите изображение с QR-кодом
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    disabled={loading}
                  >
                    Выбрать файл
                  </Button>
                </div>
              </div>

              {/* Ручной ввод */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ручной ввод кода
                </h3>
                
                <div className="max-w-md mx-auto space-y-4">
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Введите код валидации или QR-данные"
                    className="text-center"
                  />
                  
                  <Button
                    onClick={handleManualValidation}
                    disabled={!manualCode.trim() || loading}
                    className="w-full bg-sky-600 hover:bg-sky-700"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Проверка...
                      </div>
                    ) : (
                      'Проверить билет'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Информация для сотрудников */}
        <div className="mt-8 pt-6 border-t">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-1">Инструкция для сотрудников</h4>
                <ul className="space-y-1">
                  <li>• Убедитесь, что билет действителен и не использован</li>
                  <li>• Проверьте соответствие времени посещения</li>
                  <li>• При проблемах обратитесь к администратору</li>
                  <li>• Ведите учет всех сканирований</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TicketScanner; 
 