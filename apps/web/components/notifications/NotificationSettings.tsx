'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, Save, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notificationService, type NotificationSettings } from '@/services/notificationService';

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadSettings();
    checkPushSupport();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = async () => {
    const supported = notificationService.isSupported();
    setPushSupported(supported);
    
    if (supported) {
      setPushPermission(Notification.permission);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await notificationService.updateNotificationSettings(settings);
      
      // Показываем уведомление об успехе
      await notificationService.showLocalNotification(
        'Настройки сохранены! ✅',
        {
          body: 'Ваши настройки уведомлений успешно обновлены',
          icon: '/icons/settings.png'
        }
      );
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePushNotifications = async () => {
    try {
      const subscription = await notificationService.subscribeToPush();
      if (subscription) {
        handleSettingChange('push_notifications', true);
        setPushPermission('granted');
        
        // Тестовое уведомление
        await notificationService.showLocalNotification(
          'Push уведомления включены! 🔔',
          {
            body: 'Теперь вы будете получать уведомления от Sky Park',
            icon: '/icons/bell.png'
          }
        );
      }
    } catch (error) {
      console.error('Ошибка включения push уведомлений:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
            <p className="text-sm text-gray-600">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ошибка загрузки настроек
          </h3>
          <p className="text-gray-600">
            Не удалось загрузить настройки уведомлений
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Настройки уведомлений
        </h1>
        <p className="text-gray-600">
          Управляйте способами получения уведомлений от Sky Park
        </p>
      </div>

      <div className="space-y-6">
        {/* Общие настройки */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-sky-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Уведомления
                </h3>
                <p className="text-sm text-gray-600">
                  Включить или отключить все уведомления
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </Card>

        {/* Способы доставки */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Способы доставки уведомлений
          </h3>
          
          <div className="space-y-4">
            {/* Push уведомления */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Push уведомления
                  </h4>
                  <p className="text-sm text-gray-600">
                    Мгновенные уведомления в браузере
                  </p>
                  {!pushSupported && (
                    <p className="text-xs text-red-600">
                      Не поддерживается в вашем браузере
                    </p>
                  )}
                  {pushSupported && pushPermission === 'denied' && (
                    <p className="text-xs text-red-600">
                      Разрешение отклонено. Включите в настройках браузера
                    </p>
                  )}
                </div>
              </div>
              
              {pushSupported && pushPermission !== 'denied' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push_notifications && pushPermission === 'granted'}
                    onChange={(e) => {
                      if (e.target.checked && pushPermission !== 'granted') {
                        handleEnablePushNotifications();
                      } else {
                        handleSettingChange('push_notifications', e.target.checked);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              ) : (
                <div className="text-sm text-gray-400">Недоступно</div>
              )}
            </div>

            {/* Email уведомления */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Email уведомления
                  </h4>
                  <p className="text-sm text-gray-600">
                    Уведомления на электронную почту
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* SMS уведомления */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    SMS уведомления
                  </h4>
                  <p className="text-sm text-gray-600">
                    Уведомления на мобильный телефон
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sms_notifications}
                  onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Типы уведомлений */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Типы уведомлений
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Бронирования</h4>
                <p className="text-sm text-gray-600">
                  Подтверждения, изменения, напоминания
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.booking_notifications}
                  onChange={(e) => handleSettingChange('booking_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Платежи</h4>
                <p className="text-sm text-gray-600">
                  Успешные платежи, возвраты, ошибки
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_notifications}
                  onChange={(e) => handleSettingChange('payment_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Программа лояльности</h4>
                <p className="text-sm text-gray-600">
                  Начисление баллов, повышения статуса
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loyalty_notifications}
                  onChange={(e) => handleSettingChange('loyalty_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Маркетинговые предложения</h4>
                <p className="text-sm text-gray-600">
                  Скидки, акции, специальные предложения
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketing_notifications}
                  onChange={(e) => handleSettingChange('marketing_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Напоминания</h4>
                <p className="text-sm text-gray-600">
                  Напоминания о предстоящих визитах
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminder_notifications}
                  onChange={(e) => handleSettingChange('reminder_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Кнопка сохранения */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={loadSettings}
          >
            Сбросить изменения
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Сохранение...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage; 