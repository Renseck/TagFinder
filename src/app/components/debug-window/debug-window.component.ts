import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LogEntry, LoggingService } from '../../services/logging/logging.service';
import { Subject, takeUntil } from 'rxjs';

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
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './debug-window.component.html',
  styleUrl: './debug-window.component.css'
})
export class DebugWindowComponent implements OnInit, OnDestroy,AfterViewChecked {
  // Backwards compatibility
  @Input() logs: string[] = [];
  @Input() progressCurrent: number = 0;
  @Input() progressTotal: number = 0;
  @Input() progressMessage: string = '';
  @Input() loading: boolean = false;
  @Input() currentAction: string = '';
  @Input() showAlways: boolean = true;

  @Output() clearLogs = new EventEmitter<void>();

  collapsed = false;
  autoScroll = true;
  showLogLevel = true;

  // New logs
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

  ngAfterViewChecked(): void {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
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

  getStructuredLogs(): LogEntry[] {
    return this.logger.getAllLogs();
  }

  getLogLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return '#e74c3c';
      case 'WARN': return '#f39c12';
      case 'INFO': return '#3498db';
      case 'DEBUG': return '#95a5a6';
      default: return '#333';
    }
  }

  getLogLevelIcon(level: string): string {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'error';
      case 'WARN':
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'DEBUG': return 'bug_report';
      case 'PROGRESS': return 'trending_up';
      default: return 'circle';
    }
  }

  /* ============================================================================================ */
  private formatStructuredLog(log: LogEntry): string {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
    return `${time} [${log.level}] [${log.component}] ${log.message}${dataStr}`;
  }


  /* ============================================================================================ */
  trackByIndex(index: number, item: string): number {
    return index;
  }

  /* ============================================================================================ */
  trackByLog(index: number, item: DisplayLogEntry): string {
    return `${item.timestamp}-${item.component}-${item.message}`;
  }

  /* ============================================================================================ */
  isRecentLog(index: number, totalLogs: number): boolean {
    return index >= totalLogs - 3; // Tune as needed
  }

  /* ============================================================================================ */
  getProgressPercentage(): number {
    if (this.progressTotal === 0) return 0;
    return Math.round((this.progressCurrent / this.progressTotal) * 100);
  }

  /* ============================================================================================ */
  exportLogs(): void {
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
  clearAllLogs(): void {
    this.logger.clearLogs();
    this.clearLogs.emit();
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

  /* ============================================================================================ */
  private scrollToBottom(): void {
    const logsContainer = document.querySelector(".debug-logs");
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }
}
