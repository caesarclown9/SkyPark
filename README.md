# 🎡 Sky Park - Digital Entertainment Platform

> Цифровая платформа для развлекательных центров Кыргызстана

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 🌟 О проекте

Sky Park — это современная PWA платформа, разработанная специально для развлекательных центров Бишкека. Проект решает проблему очередей и отсутствия онлайн-бронирования через QR-билеты и систему лояльности.

### 🎯 Ключевые возможности

- 📱 **PWA приложение** с offline-first архитектурой
- 🎫 **QR-билеты** для быстрого прохода без очередей
- 💳 **Локальные платежи** (ЭЛQR, Элкарт, M-Bank, O!Деньги)
- 🎁 **3-уровневая система лояльности** (Новичок, Друг, VIP)
- 📊 **Реальный мониторинг** загруженности парков
- 🌐 **Многоязычность** (русский/кыргызский)

## 🏗️ Архитектура

Проект построен на основе **BMAD методологии** с чистой архитектурой:

```
apps/
├── web/          # Next.js 14 PWA
├── api/          # Go 1.22 Backend
├── mobile/       # React Native
└── admin/        # Admin Panel

packages/
├── shared/       # Общие типы и утилиты
├── ui/           # UI компоненты
└── config/       # Конфигурации

infrastructure/
├── k3s/          # Kubernetes манифесты
├── terraform/    # IaC конфигурации
└── docker/       # Docker образы
```

### 🛠️ Технологический стек

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5.3.3
- Tailwind CSS (Rainbow of Joy Design System)
- Zustand (State Management)
- React Hook Form + Zod

**Backend:**
- Go 1.22 + Gin Framework
- Event Sourcing + CQRS
- PostgreSQL 15.5 + Redis 7.2
- RabbitMQ 3.12

**Infrastructure:**
- K3s Kubernetes
- Prometheus + Grafana
- Docker + Docker Compose

## 🚀 Быстрый старт

### Предварительные требования

- Node.js ≥ 18.0.0
- Go ≥ 1.22
- Docker & Docker Compose
- PowerShell (Windows)

### 1. Клонирование репозитория

```powershell
git clone https://github.com/skypark/skypark.git
cd skypark
```

### 2. Настройка окружения

```powershell
# Копирование примера конфигурации
Copy-Item env.example .env.development

# Установка зависимостей
npm install
```

### 3. Запуск development окружения

```powershell
# Запуск всех сервисов
npm run docker:up

# Или запуск только frontend
npm run dev:web

# Или запуск только backend
npm run dev:api
```

### 4. Инициализация базы данных

```powershell
# Применение миграций
npm run db:migrate

# Заполнение тестовыми данными
npm run db:seed
```

## 📚 Документация

- [📋 Product Requirements](./docs/prd.md)
- [🎨 Frontend Specification](./docs/frontend-specification.md)
- [🏗️ Backend Architecture](./docs/backend-architecture.md)
- [🗄️ Database Schema](./docs/database-schema.md)
- [🔌 API Specification](./docs/api-specification.md)
- [📦 Project Structure](./docs/project-structure.md)
- [☁️ Infrastructure Setup](./docs/infrastructure-setup.md)
- [🔄 Development Workflow](./docs/development-workflow.md)
- [📈 BMAD Next Steps](./docs/bmad-next-steps.md)

## 🌐 Доступные URL

**Development окружение:**

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:8080
- 📊 **Swagger**: http://localhost:8080/docs
- 📈 **Grafana**: http://localhost:3001
- 🔍 **Prometheus**: http://localhost:9090
- 🐰 **RabbitMQ**: http://localhost:15672

## 🧪 Тестирование

```powershell
# Запуск всех тестов
npm run test

# Unit тесты
npm run test:unit

# E2E тесты
npm run test:e2e

# Тесты с UI
npm run test:ui
```

## 📦 Деплой

### Development

```powershell
npm run docker:up
```

### Staging

```powershell
npm run k8s:deploy staging
```

### Production

```powershell
npm run k8s:deploy production
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/AmazingFeature`
3. Commit изменения: `git commit -m 'Add AmazingFeature'`
4. Push в branch: `git push origin feature/AmazingFeature`
5. Создайте Pull Request

### 📝 Код-стиль

Проект использует автоматическое форматирование:

```powershell
# Проверка линтера
npm run lint

# Автоисправление
npm run lint:fix

# Проверка типов
npm run type-check
```

## 📊 Метрики проекта

- **Цель**: 10,000+ ежедневных посетителей
- **Охват**: 6 локаций в Бишкеке
- **Языки**: Русский, Кыргызский
- **Платформы**: Web (PWA), Mobile (iOS/Android)

## 🛡️ Безопасность

- JWT аутентификация
- Rate limiting
- CORS защита
- Input validation
- SQL injection prevention
- XSS protection

## 📞 Поддержка

- **Email**: dev@skypark.kg
- **Telegram**: @skypark_support
- **Documentation**: [docs/index.md](./docs/index.md)

## 📄 Лицензия

Proprietary License - Sky Park Development Team

---

**Сделано с ❤️ командой Sky Park** 
 