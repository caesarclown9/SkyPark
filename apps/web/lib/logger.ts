type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    // Добавляем в локальный буфер
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // В разработке выводим в консоль
    if (this.isDevelopment) {
      const logMethod = console[level] || console.log;
      logMethod(
        `[${level.toUpperCase()}] ${message}`,
        context ? { context } : '',
        error || ''
      );
    }

    // В продакшене можно отправлять в внешний сервис
    if (!this.isDevelopment && level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, context, error);
  }

  // Получить последние логи для debugging
  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }

  // Очистить логи
  clearLogs() {
    this.logs = [];
  }

  private async sendToExternalService(entry: LogEntry) {
    // Здесь можно интегрировать с Sentry, LogRocket, или другими сервисами
    // Пока что просто заглушка
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      // Не логируем ошибки логирования, чтобы избежать бесконечного цикла
    }
  }
}

// Создаем единственный экземпляр
export const logger = new Logger();

// Вспомогательные функции для типичных случаев
export const logApiError = (operation: string, error: Error, context?: Record<string, unknown>) => {
  logger.error(`API Error: ${operation}`, error, {
    operation,
    ...context,
  });
};

export const logUserAction = (action: string, context?: Record<string, unknown>) => {
  logger.info(`User Action: ${action}`, {
    action,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export const logPerformance = (operation: string, duration: number, context?: Record<string, unknown>) => {
  logger.debug(`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...context,
  });
}; 