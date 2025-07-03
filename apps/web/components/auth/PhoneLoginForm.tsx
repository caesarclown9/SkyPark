'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { AlertCircle, Smartphone, Clock, CheckCircle } from 'lucide-react'

interface PhoneLoginFormProps {
  onSuccess?: () => void
}

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const [step, setStep] = useState<'phone' | 'verification' | 'profile'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const { sendSMSCode, verifyAndLogin, isLoading, error, clearError } = useAuthStore()

  // Format phone number for Kyrgyzstan
  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // If starts with 996, add +
    if (digits.startsWith('996')) {
      return `+${digits.slice(0, 12)}`
    }
    
    // If starts with 0, replace with +996
    if (digits.startsWith('0')) {
      return `+996${digits.slice(1, 10)}`
    }
    
    // If no country code, add +996
    if (digits.length > 0 && !digits.startsWith('996')) {
      return `+996${digits.slice(0, 9)}`
    }
    
    return `+${digits.slice(0, 12)}`
  }

  const validateKyrgyzstanPhone = (phone: string) => {
    const phoneRegex = /^\+996[0-9]{9}$/
    return phoneRegex.test(phone)
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    clearError()
    
    if (!validateKyrgyzstanPhone(phone)) {
      return
    }

    try {
      await sendSMSCode(phone)
      setStep('verification')
      startCountdown()
    } catch (error) {
      // Error handled by store
    }
  }

  const handleVerifyCode = async () => {
    clearError()
    
    if (code.length !== 6) {
      return
    }

    try {
      if (isNewUser) {
        setStep('profile')
      } else {
        await verifyAndLogin(phone, code)
        onSuccess?.()
      }
    } catch (error: unknown) {
      if (error.message?.includes('new user') || error.message?.includes('registration')) {
        setIsNewUser(true)
        setStep('profile')
      }
    }
  }

  const handleCompleteRegistration = async () => {
    clearError()

    try {
      await verifyAndLogin(phone, code, {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
      })
      onSuccess?.()
    } catch (error) {
      // Error handled by store
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    
    try {
      await sendSMSCode(phone)
      startCountdown()
    } catch (error) {
      // Error handled by store
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6 text-sky-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {step === 'phone' && 'Вход в Sky Park'}
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
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
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
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
                className="text-sm"
              >
                {countdown > 0 ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Повторная отправка через {countdown}с
                  </div>
                ) : (
                  'Отправить код повторно'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Номер телефона подтвержден!</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Айбек"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Токтогулов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input
                id="email"
                type="email"
                placeholder="aybek@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCompleteRegistration}
              disabled={!firstName || !lastName || isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700"
              size="lg"
            >
              {isLoading ? 'Завершение...' : 'Завершить регистрацию'}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-center text-gray-500">
            Продолжая, вы соглашаетесь с условиями использования Sky Park
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 
 