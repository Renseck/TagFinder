import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logs: LogEntry[] = [];
  private logsSubject = new BehaviorSubject<LogEntry[]>([]);
  private maxLogEntries = 200;

  public logs$ = this.logsSubject.asObservable();

  constructor() { }

  /* ========================================= Privates ========================================= */
  private addLog(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', component: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      component,
      message,
      data
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    this.logsSubject.next([...this.logs]);
    this.logToConsole(logEntry);
  }

  /* ============================================================================================ */
  private logToConsole(log: LogEntry): void {
    const formattedMessage = this.formatLogEntry(log);

    switch(log.level) {
      case 'DEBUG':
        console.debug(formattedMessage);
        break;
      case 'INFO':
        console.info(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'ERROR':
        console.error(formattedMessage);
        break;
    }
  }

  /* ========================================================================================== */
  private formatLogEntry(log: LogEntry): string {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const dataStr = log.data ? ` | data: ${JSON.stringify(log.data)}` : '';
    return `${time} [${log.level}] [${log.component}] ${log.message}${dataStr}`;
  }

  /* ========================================== Publics ========================================= */
  debug(component: string, message: string, data?: any): void {
    this.addLog('DEBUG', component, message, data);
  }

  info(component: string, message: string, data?: any): void {
    this.addLog('INFO', component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.addLog('WARN', component, message, data);
  }

  error(component: string, message: string, data?: any): void {
    this.addLog('ERROR', component, message, data);
  }

  /* ============================================================================================ */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  getFormattedLogs(): string[] {
    return this.logs.map(log => this.formatLogEntry(log));
  }

  getLogsByLevel(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  /* ============================================================================================ */
  clearLogs(): void {
    this.logs = [];
    this.logsSubject.next([]);
  }

  exportLogs(): string {
    return this.logs.map(log => this.formatLogEntry(log)).join('\n');
  }
}
