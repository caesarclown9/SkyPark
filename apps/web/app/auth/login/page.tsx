'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/stores/useAuthStore';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'verification' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const { sendSMSCode, verifyAndLogin, isLoading, error, clearError } = useAuthStore();

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
      if (isNewUser) {
        setStep('profile');
      } else {
        await verifyAndLogin(phone, code);
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      if (error.message?.includes('new user') || error.message?.includes('registration')) {
        setIsNewUser(true);
        setStep('profile');
      }
    }
  };

  const handleCompleteRegistration = async () => {
    clearError();

    try {
      await verifyAndLogin(phone, code, {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
      });
      router.push('/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-sky-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === 'phone' && 'Добро пожаловать в Sky Park'}
            {step === 'verification' && 'Подтверждение номера'}
            {step === 'profile' && 'Завершение регистрации'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' && 'Введите номер телефона для входа или регистрации'}
            {step === 'verification' && `Введите код из SMS, отправленного на ${phone}`}
            {step === 'profile' && 'Заполните информацию профиля'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+996 XXX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="text-lg"
                  maxLength={13}
                />
                <p className="text-xs text-gray-500">
                  Поддерживаются номера операторов Кыргызстана (Beeline, MegaCom, O!, NurTelecom)
                </p>
                {DEMO_MODE && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                    <span className="text-xs">🎭 Demo режим: введите любой номер +996XXXXXXXXX</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSendCode}
                disabled={!validateKyrgyzstanPhone(phone) || isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                {isLoading ? 'Отправка...' : 'Получить SMS код'}
              </Button>

              {/* Admin Login Link */}
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-gray-600 mb-2">Вы администратор?</p>
                <Link
                  href="/auth/admin"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Вход в административную панель
                </Link>
              </div>
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-lg text-center tracking-widest"
                  maxLength={6}
                />
                {DEMO_MODE && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                    <span className="text-xs">🎭 Demo режим: введите любой 6-значный код</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                {isLoading ? 'Проверка...' : 'Подтвердить код'}
              </Button>

              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Повторная отправка через {countdown} сек</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Отправить код повторно
                  </button>
                )}
                
                <div>
                  <button
                    onClick={() => {
                      setStep('phone');
                      setCode('');
                      setCountdown(0);
                      clearError();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Изменить номер телефона
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Номер подтвержден!</p>
                <p className="text-green-700 text-sm">Теперь заполните профиль</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ваша фамилия"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (необязательно)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Для получения уведомлений и специальных предложений
                </p>
              </div>

              <Button
                onClick={handleCompleteRegistration}
                disabled={!firstName.trim() || !lastName.trim() || isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                {isLoading ? 'Создание профиля...' : 'Завершить регистрацию'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
 