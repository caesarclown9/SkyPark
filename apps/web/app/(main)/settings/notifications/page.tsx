'use client';

import { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, Shield, ArrowLeft } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import PageWrapper from '@/components/layout/PageWrapper';
import Link from 'next/link';

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  promotional_notifications: boolean;
  reminder_notifications: boolean;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    booking_notifications: true,
    payment_notifications: true,
    promotional_notifications: false,
    reminder_notifications: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
        enabled ? 'bg-purple-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <PageWrapper 
      title="Настройки уведомлений" 
      subtitle="🔔 Настройте способы получения важной информации о ваших бронированиях"
      showBackButton={true}
      backButtonText="Назад в кабинет"
      backButtonHref="/dashboard"
    >
      <div className="max-w-4xl mx-auto">
        {/* Способы доставки */}
        <div className="skypark-card mb-8">
          <div className="flex items-center mb-6">
            <Smartphone className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-skypark-gradient">
              📱 Способы доставки
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Push-уведомления</h3>
                  <p className="text-sm text-gray-600">Мгновенные уведомления в браузере</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.push_enabled} 
                onChange={(value) => updateSetting('push_enabled', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email уведомления</h3>
                  <p className="text-sm text-gray-600">Отправка на электронную почту</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.email_enabled} 
                onChange={(value) => updateSetting('email_enabled', value)}
              />
            </div>
          </div>
        </div>

        {/* Типы уведомлений */}
        <div className="skypark-card mb-8">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-skypark-gradient">
              🎯 Типы уведомлений
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div>
                <h3 className="font-semibold text-gray-900">🎫 Бронирования</h3>
                <p className="text-sm text-gray-600">Подтверждения, изменения статуса</p>
              </div>
              <ToggleSwitch 
                enabled={settings.booking_notifications} 
                onChange={(value) => updateSetting('booking_notifications', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div>
                <h3 className="font-semibold text-gray-900">💳 Платежи</h3>
                <p className="text-sm text-gray-600">Успешные операции, чеки</p>
              </div>
              <ToggleSwitch 
                enabled={settings.payment_notifications} 
                onChange={(value) => updateSetting('payment_notifications', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div>
                <h3 className="font-semibold text-gray-900">🎁 Акции и скидки</h3>
                <p className="text-sm text-gray-600">Специальные предложения</p>
              </div>
              <ToggleSwitch 
                enabled={settings.promotional_notifications} 
                onChange={(value) => updateSetting('promotional_notifications', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 skypark-card-compact">
              <div>
                <h3 className="font-semibold text-gray-900">⏰ Напоминания</h3>
                <p className="text-sm text-gray-600">О предстоящих визитах</p>
              </div>
              <ToggleSwitch 
                enabled={settings.reminder_notifications} 
                onChange={(value) => updateSetting('reminder_notifications', value)}
              />
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="btn-skypark-primary px-8 py-3 disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : '💾 Сохранить настройки'}
          </button>
          
          <Link href="/dashboard" className="btn-skypark-outline px-8 py-3 text-center">
            ⬅️ Назад в кабинет
          </Link>
        </div>

        {/* Уведомление о сохранении */}
        {saved && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-700 px-6 py-3 rounded-2xl shadow-lg z-50">
            ✅ Настройки сохранены!
          </div>
        )}
      </div>
    </PageWrapper>
  );
} 