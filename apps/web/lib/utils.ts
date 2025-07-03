import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * API конфигурация
 */
export const API_BASE_URL = '/api' // Next.js API routes

/**
 * Функция для объединения CSS классов с поддержкой условной логики
 * Использует clsx для условных классов и tailwind-merge для дедупликации Tailwind классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование номера телефона для Кыргызстана
 */
export function formatPhone(phone: string): string {
  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '')
  
  // Если начинается с 996, добавляем +
  if (digits.startsWith('996')) {
    return `+${digits.slice(0, 12)}`
  }
  
  // Если начинается с 0, заменяем на +996
  if (digits.startsWith('0')) {
    return `+996${digits.slice(1, 10)}`
  }
  
  // Если нет кода страны, добавляем +996
  if (digits.length > 0 && !digits.startsWith('996')) {
    return `+996${digits.slice(0, 9)}`
  }
  
  return `+${digits.slice(0, 12)}`
}

/**
 * Валидация кыргызстанского номера телефона
 */
export function validateKyrgyzstanPhone(phone: string): boolean {
  const phoneRegex = /^\+996[0-9]{9}$/
  return phoneRegex.test(phone)
}

/**
 * Форматирование суммы в сомах
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-KG', {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Форматирование даты для отображения
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-KG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Форматирование времени
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-KG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Форматирование даты и времени
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-KG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Получение относительного времени (например, "2 часа назад")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'только что'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ч назад`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} дн назад`
  }

  return formatDate(d)
}

/**
 * Функция для сжатия текста
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Функция для капитализации первой буквы
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Генерация случайного ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Проверка валидности email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Извлечение инициалов из имени
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase()
}

/**
 * Функция для безопасного парсинга JSON
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return defaultValue
  }
}

/**
 * Функция для дебаунса
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 