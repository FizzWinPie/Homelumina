/**
 * Client-side Logger Utility
 * Provides structured logging with different levels and environment-based configuration
 */

export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  service?: string;
  version?: string;
}

class Logger {
  private level: number;
  private service: string;
  private version: string;
  private isDevelopment: boolean;

  constructor() {
    this.service = 'cis-5500-client';
    this.version = '1.0.0';
    this.isDevelopment = import.meta.env.DEV;
    
    // Set log level based on environment
    const envLevel = import.meta.env.VITE_LOG_LEVEL;
    if (envLevel === 'error') this.level = LogLevel.ERROR;
    else if (envLevel === 'warn') this.level = LogLevel.WARN;
    else if (envLevel === 'info') this.level = LogLevel.INFO;
    else if (envLevel === 'debug') this.level = LogLevel.DEBUG;
    else this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: number): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      service: this.service,
      version: this.version
    };
  }

  private log(level: number, levelName: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(levelName, message, data);
    
    if (this.isDevelopment) {
      // In development, use console with colors
      const style = this.getConsoleStyle(levelName);
      console.group(`%c[${levelName.toUpperCase()}] ${message}`, style);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', logEntry.timestamp);
      console.log('Service:', logEntry.service);
      console.log('Version:', logEntry.version);
      console.groupEnd();
    } else {
      // In production, use structured logging
      const logString = JSON.stringify(logEntry);
      
      switch (levelName) {
        case 'error':
          console.error(logString);
          break;
        case 'warn':
          console.warn(logString);
          break;
        case 'info':
          console.info(logString);
          break;
        case 'debug':
          console.debug(logString);
          break;
        default:
          console.log(logString);
      }
    }
  }

  private getConsoleStyle(level: string): string {
    switch (level) {
      case 'error':
        return 'color: #ff0000; font-weight: bold;';
      case 'warn':
        return 'color: #ffa500; font-weight: bold;';
      case 'info':
        return 'color: #0066cc; font-weight: bold;';
      case 'debug':
        return 'color: #666666; font-weight: bold;';
      default:
        return 'color: #000000; font-weight: bold;';
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'error', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, data);
  }

  // Convenience methods for common logging patterns
  logApiCall(endpoint: string, method: string, data?: any): void {
    this.debug(`API ${method} call to ${endpoint}`, data);
  }

  logApiResponse(endpoint: string, method: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`API ${method} call to ${endpoint} failed with status ${status}`, data);
    } else {
      this.debug(`API ${method} call to ${endpoint} succeeded with status ${status}`, data);
    }
  }

  logUserAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data);
  }

  logError(error: Error, context?: string): void {
    this.error(`Error${context ? ` in ${context}` : ''}: ${error.message}`, {
      name: error.name,
      stack: error.stack,
      context
    });
  }

  logPerformance(operation: string, duration: number, data?: any): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, data);
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`, data);
    }
  }
}

// Create and export a singleton logger instance
export const logger = new Logger();

// Export the Logger class for testing or custom instances
export { Logger }; 