'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/stores/useAuthStore';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const { sendSMSCode, adminLogin, isLoading, error, clearError } = useAuthStore();

  // Format phone number for Kyrgyzstan
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('996')) {
      return `+${digits.slice(0, 12)}`;
    }
    
    if (digits.startsWith('0')) {
      return `+996${digits.slice(1, 10)}`;
    }
    
    if (digits.length > 0 && !digits.startsWith('996')) {
      return `+996${digits.slice(0, 9)}`;
    }
    
    return `+${digits.slice(0, 12)}`;
  };

  const validateKyrgyzstanPhone = (phone: string) => {
    const phoneRegex = /^\+996[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    clearError();
    
    if (!validateKyrgyzstanPhone(phone)) {
      return;
    }

    try {
      await sendSMSCode(phone);
      setStep('verification');
      startCountdown();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleVerifyCode = async () => {
    clearError();
    
    if (code.length !== 6) {
      return;
    }

    try {
      await adminLogin(phone, code);
      router.push('/admin');
    } catch (error) {
      // Error handled by store
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      await sendSMSCode(phone);
      startCountdown();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-pulse"></div>
      
      {/* Security Badge */}
      <div className="absolute top-8 right-8 flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-slate-300 text-sm font-medium">Защищенное соединение</span>
      </div>

      <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-800">
                <Smartphone className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Sky Park
            </h1>
            <h2 className="text-lg font-semibold text-slate-300 mb-1">
              Административная панель
            </h2>
            <p className="text-slate-400 text-sm">
              {step === 'phone' ? 'Введите номер телефона администратора' : 'Введите код подтверждения'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Ошибка</p>
                <p className="text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="phone" className="text-slate-200 font-medium flex items-center mb-3">
                  <Smartphone className="w-4 h-4 mr-2 text-slate-400" />
                  Номер телефона администратора
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+996 XXX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 text-lg h-12"
                  maxLength={13}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Только номера, зарегистрированные как администраторы
                </p>
                {DEMO_MODE && (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 mt-3">
                    <span className="text-xs">🎭 Demo режим: используйте +996700123456</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSendCode}
                disabled={!validateKyrgyzstanPhone(phone) || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg shadow-blue-900/20 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-3"></div>
                    Отправка кода...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Получить SMS код
                  </div>
                )}
              </Button>
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="code" className="text-slate-200 font-medium flex items-center mb-3">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" />
                  Код подтверждения
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 text-lg h-12 text-center tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Код отправлен на номер {phone}
                </p>
                {DEMO_MODE && (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 mt-3">
                    <span className="text-xs">🎭 Demo режим: используйте любой 6-значный код</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg shadow-blue-900/20 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-3"></div>
                    Проверка...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Войти в систему
                  </div>
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Повторная отправка через {countdown} сек</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Отправить код повторно
                  </button>
                )}
              </div>

              {/* Back to phone */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                    setCountdown(0);
                    clearError();
                  }}
                  className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
                >
                  ← Изменить номер телефона
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 