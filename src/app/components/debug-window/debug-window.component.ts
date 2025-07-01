import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry, LoggingService } from '../../services/logging/logging.service';
import { Subject, takeUntil } from 'rxjs';

import { DebugActionsComponent } from './debug-actions/debug-actions.component';
import { LogListComponent } from './log-list/log-list.component';
import { LogEntryData } from './log-entry/log-entry.component';

interface DisplayLogEntry {
  timestamp: string;
  level: string;
  component: string;
  message: string;
  data?: any;
  isStructured: boolean;
  rawLog: string;
}

@Component({
  selector: 'app-debug-window',
  standalone: true,
  imports: [
    CommonModule,
    DebugActionsComponent,
    LogListComponent
  ],
  templateUrl: './debug-window.component.html',
  styleUrl: './debug-window.component.css'
})
export class DebugWindowComponent implements OnInit, OnDestroy {
  // Backwards compatibility
  @Input() logs: string[] = [];
  @Input() progressCurrent: number = 0;
  @Input() progressTotal: number = 0;
  @Input() progressMessage: string = '';
  @Input() loading: boolean = false;
  @Input() currentAction: string = '';
  @Input() showAlways: boolean = true;

  @Output() clearLogs = new EventEmitter<void>();

  // Component state
  collapsed = false;
  autoScroll = true;
  showLogLevel = true;
  structuredLogs: LogEntry[] = [];
  private destroy$ = new Subject<void>();

  /* ============================================================================================ */
  constructor(private logger: LoggingService) {}

  /* ============================================================================================ */
  ngOnInit(): void {
    this.logger.logs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => {
        this.structuredLogs = logs;
      });
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }
  
  /* ============================================================================================ */
  getAllDisplayLogs(): DisplayLogEntry[] {
    const displayLogs: DisplayLogEntry[] = [];

    // Add structured logs from LoggingService
    this.structuredLogs.forEach(log => {
      displayLogs.push({
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
        level: log.level,
        component: log.component,
        message: log.message,
        data: log.data,
        isStructured: true,
        rawLog: this.formatStructuredLog(log),
      });
    });

    // Add legacy string logs (for backward compatibility)
    this.logs.forEach(log => {
      const timestamp = this.extractTimestamp(log);
      const level = this.extractLogLevel(log);
      const component = this.extractComponent(log);
      const message = this.extractMessage(log);

      displayLogs.push({
        timestamp,
        level: level || 'INFO',
        component: component || 'SYSTEM',
        message,
        isStructured: false,
        rawLog: log,
      });
    });

    // Sort by timestamp (oldest first for display)
    return displayLogs.sort((a, b) => {
      const timeA = this.parseDisplayTime(a.timestamp);
      const timeB = this.parseDisplayTime(b.timestamp);
      return timeA - timeB;
    });

  }

  /* ============================================================================================ */
  getStructuredLogs(): LogEntry[] {
    return this.logger.getAllLogs();
  }

  /* ============================================================================================ */
  getProgressPercentage(): number {
    if (this.progressTotal === 0) return 0;
    return Math.round((this.progressCurrent / this.progressTotal) * 100);
  }

  /* ============================================================================================ */
  onClearLogs(): void {
    this.logger.clearLogs();
    this.clearLogs.emit();
  }

  /* ============================================================================================ */
  onToggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  /* ============================================================================================ */
  onToggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
  }

  /* ============================================================================================ */
  onToggleShowLogLevel(): void {
    this.showLogLevel = !this.showLogLevel;
  }

  /* ============================================================================================ */
  onExportLogs(): void {
    const allLogs = this.getAllDisplayLogs();
    const logText = allLogs.map(log => {
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `${log.timestamp} [${log.level}] [${log.component}] ${log.message}${dataStr}`;
    }).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /* ============================================================================================ */
  private formatStructuredLog(log: LogEntry): string {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
    return `${time} [${log.level}] [${log.component}] ${log.message}${dataStr}`;
  }

  /* ============================================================================================ */
  private extractTimestamp(log: string): string {
    const match = log.match(/(\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : new Date().toLocaleTimeString();
  }

  /* ============================================================================================ */
  private extractLogLevel(log: string): string | null {
    const match = log.match(/\[(DEBUG|INFO|WARN|WARNING|ERROR|PROGRESS)\]/i);
    return match ? match[1].toUpperCase() : null;
  }

  /* ============================================================================================ */
  private extractComponent(log: string): string | null {
    // Look for pattern like [COMPONENT_NAME] after the log level
    const match = log.match(/\[(?:DEBUG|INFO|WARN|WARNING|ERROR|PROGRESS)\]\s*\[([^\]]+)\]/i);
    return match ? match[1] : null;
  }

  /* ============================================================================================ */
  private extractMessage(log: string): string {
    // Remove timestamp, log level, and component to get the message
    let message = log;
    
    // Remove timestamp
    message = message.replace(/^\d{2}:\d{2}:\d{2}\s*/, '');
    
    // Remove log level
    message = message.replace(/\[(?:DEBUG|INFO|WARN|WARNING|ERROR|PROGRESS)\]\s*/i, '');
    
    // Remove component
    message = message.replace(/\[[^\]]+\]\s*/, '');
    
    return message.trim() || log;
  }

  /* ============================================================================================ */
  private parseDisplayTime(timeStr: string): number {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const now = new Date();
    const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
    return time.getTime();
  }
}
