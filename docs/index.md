# Sky Park Project Documentation

## 📋 Обзор проекта

**Sky Park** - это цифровая платформа для сети детских развлекательных центров в Бишкеке, Кыргызстан. Проект направлен на устранение очередей и создание современного опыта покупки билетов через Progressive Web Application (PWA).

### 🎯 Основные цели
- Цифровизация процесса покупки билетов
- Создание системы лояльности для постоянных клиентов
- Обеспечение offline-first архитектуры для условий Кыргызстана
- Интеграция с местными платежными системами

### 📊 Ключевые показатели
- **6 локаций** Sky Park в Бишкеке
- **10,000+** посетителей в день
- **Цель**: 60% сокращение времени ожидания в очередях
- **Цель**: 80% адаптация мобильного приложения за 6 месяцев

## 📚 Документация

### 1. 📝 [Product Requirements Document (PRD)](./prd.md)
**Полные требования к продукту**
- Анализ рынка и целевой аудитории
- Функциональные и технические требования
- Пользовательские истории и критерии приемки
- Метрики успеха и план запуска

### 2. 🎨 [Frontend Specification](./frontend-specification.md)
**Детальная спецификация пользовательского интерфейса**
- Дизайн-система "Rainbow of Joy"
- Компонентная библиотека React/Next.js
- Адаптивный дизайн и доступность
- Производительность и оптимизация

### 3. ⚙️ [Backend Architecture](./backend-architecture.md)
**Архитектура серверной части**
- Go-based микросервисная архитектура
- Event Sourcing и CQRS паттерны
- API эндпоинты и бизнес-логика
- Интеграции с платежными системами

### 4. 🗄️ [Database Schema](./database-schema.md)
**Схема базы данных и оптимизация**
- PostgreSQL с JSONB поддержкой
- Event sourcing таблицы
- Индексы и производительность
- Стратегия бэкапов

### 5. 🔌 [API Specification](./api-specification.md)
**OpenAPI 3.0 спецификация**
- REST API эндпоинты
- Схемы запросов и ответов
- Аутентификация и авторизация
- Обработка ошибок и rate limiting

### 6. 🏗️ [Project Structure](./project-structure.md)
**Структура монорепозитория**
- Организация кода frontend/backend
- Shared пакеты и утилиты
- Конфигурация сборки и тестирования
- Стратегия развертывания

### 7. 🚀 [Infrastructure Setup](./infrastructure-setup.md)
**Настройка инфраструктуры K3s**
- Kubernetes манифесты
- База данных и кеширование
- Мониторинг и логирование
- Безопасность и бэкапы

### 8. 🔄 [Development Workflow](./development-workflow.md)
**Процесс разработки и развертывания**
- Git workflow и code review
- Стандарты качества кода
- Стратегия тестирования
- CI/CD пайплайн

## 🛠️ Технологический стек

### Frontend
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript 5.3.3
UI: Tailwind CSS + shadcn/ui
State: Zustand 4.5.0
Testing: Vitest + Playwright
Build: Vite 5.0
```

### Backend
```yaml
Language: Go 1.22
Framework: Gin 1.9.1
Database: PostgreSQL 15.5
Cache: Redis 7.2
Queue: RabbitMQ 3.12
Storage: MinIO (S3-compatible)
```

### Infrastructure
```yaml
Orchestration: K3s 1.28
Monitoring: Prometheus + Grafana
Logging: Loki 2.9
CI/CD: GitHub Actions
Registry: Self-hosted Docker Registry
```

## 🎨 Дизайн-система

### Цветовая палитра "Rainbow of Joy"
- **Sky Blue** (#87CEEB) - Основной бренд-цвет
- **Sunshine Yellow** (#FFD700) - Вторичный акцент
- **Soft Pink** (#FFB6C1) - Третичный цвет
- **Success Green** (#32CD32) - Успешные действия
- **Warning Orange** (#FFA500) - Предупреждения
- **Error Red** (#FF6B6B) - Ошибки

### Типографика
- **Заголовки**: Nunito (игривый, но читаемый)
- **Основной текст**: Open Sans (чистый, читаемый)

## 🚀 Быстрый старт

### Для разработчиков
```powershell
# Клонируем репозиторий
git clone https://github.com/skypark/skypark.git
cd skypark

# Устанавливаем зависимости
npm install

# Настраиваем окружение
Copy-Item .env.example .env.local

# Запускаем dev окружение
npm run dev
```

### Для DevOps
```bash
# Устанавливаем K3s кластер
./scripts/install-k3s.sh

# Развертываем приложение
./scripts/deploy.sh latest

# Проверяем статус
./scripts/health-check.sh
```

## 📱 Основные функции

### Для пользователей
- ✅ Регистрация по номеру телефона (+996)
- ✅ Просмотр парков с реальным состоянием загруженности
- ✅ Покупка билетов с QR-кодами
- ✅ Система лояльности с тремя уровнями
- ✅ Поддержка местных платежных систем
- ✅ Работа в оффлайн режиме

### Для бизнеса
- ✅ Управление загруженностью парков
- ✅ Аналитика посещений и доходов
- ✅ Автоматизация процессов входа
- ✅ Программа лояльности для удержания клиентов
- ✅ Интеграция с существующими системами

## 🔐 Безопасность

### Аутентификация
- JWT токены с 15-минутным временем жизни
- Refresh токены с 30-дневным временем жизни
- Biometric authentication поддержка
- OTP верификация через SMS

### Данные
- AES-256 шифрование данных в покое
- TLS 1.3 для передачи данных
- GDPR-совместимая обработка данных
- PCI DSS соответствие для платежей

## 🌍 Локализация

### Поддерживаемые языки
- **Русский** - основной язык интерфейса
- **Кыргызский** - дополнительный язык
- **English** - для международных пользователей (будущее)

### Местные особенности
- Формат телефона +996
- Валюта: Кыргызский сом (KGS)
- Местные платежные системы (ELQR, Элкарт, M-Bank, O!Деньги)
- Культурные особенности семейных посещений

## 📈 Метрики и мониторинг

### Бизнес-метрики
- Количество активных пользователей
- Коэффициент конверсии покупок
- Средний чек и частота посещений
- NPS (Net Promoter Score)

### Технические метрики
- Время отклика API (<100ms p95)
- Время загрузки страниц (<2s на 3G)
- Uptime (99.5% во время работы)
- Покрытие тестами (80%+)

## 🤝 Участие в проекте

### Процесс разработки
1. Создание feature branch от `develop`
2. Следование commit конвенции
3. Code review через Pull Request
4. Автоматическое тестирование в CI
5. Развертывание через GitOps

### Стандарты качества
- TypeScript для frontend без `any`
- Go с полным покрытием тестами
- ESLint + Prettier для кода
- Conventional Commits для истории

## 📞 Контакты и поддержка

### Команда разработки
- **Product Manager**: [pm@skypark.kg](mailto:pm@skypark.kg)
- **Tech Lead**: [tech@skypark.kg](mailto:tech@skypark.kg)
- **DevOps**: [devops@skypark.kg](mailto:devops@skypark.kg)

### Полезные ссылки
- **Рабочие среды**:
  - Production: [https://skypark.kg](https://skypark.kg)
  - Staging: [https://staging.skypark.kg](https://staging.skypark.kg)
  - API: [https://api.skypark.kg](https://api.skypark.kg)
- **Мониторинг**:
  - Grafana: [https://monitoring.skypark.kg](https://monitoring.skypark.kg)
  - Logs: [https://logs.skypark.kg](https://logs.skypark.kg)

## 📄 Лицензия

Этот проект разработан для Sky Park Entertainment Centers. Все права защищены.

---

**Последнее обновление**: Декабрь 2024  
**Версия документации**: 1.0  
**Ответственные**: Команда разработки Sky Park 
 