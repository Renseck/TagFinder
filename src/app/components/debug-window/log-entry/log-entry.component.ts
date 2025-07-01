import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { getLogLevelColor, getLogLevelIcon } from './log-entry.utils';

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
  getLogLevelColor = getLogLevelColor;
  getLogLevelIcon = getLogLevelIcon;

  /* ============================================================================================ */
  hasData(): boolean {
    return this.logEntry.data !== null && this.logEntry.data !== undefined;
  }
}
