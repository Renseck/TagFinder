import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface LogEntryData {
  timestamp: string;
  level: string;
  component: string;
  message: string;
  data?: any;
  isStructured: boolean;
  rawLog: string;
}

@Component({
  selector: 'app-log-entry',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './log-entry.component.html',
  styleUrl: './log-entry.component.css'
})
export class LogEntryComponent {
  @Input() logEntry!: LogEntryData;
  @Input() showLogLevel: boolean = true;
  @Input() isRecent: boolean = false;
  
  @HostBinding('class.recent-entry') get recentClass() {
    return this.isRecent;
  }

  /* ============================================================================================ */
  getLogLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return '#e74c3c';
      case 'WARN': return '#f39c12';
      case 'INFO': return '#3498db';
      case 'DEBUG': return '#95a5a6';
      default: return '#333';
    }
  }

  /* ============================================================================================ */
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
  hasData(): boolean {
    return this.logEntry.data !== null && this.logEntry.data !== undefined;
  }
}
