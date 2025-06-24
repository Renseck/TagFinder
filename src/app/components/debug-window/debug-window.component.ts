import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
export class DebugWindowComponent {
  @Input() logs: string[] = [];
  @Input() progressCurrent: number = 0;
  @Input() progressTotal: number = 0;
  @Input() progressMessage: string = '';
  @Input() loading: boolean = false;
  @Input() currentAction: string = '';
  @Input() showAlways: boolean = true;

  @Output() clearLogs = new EventEmitter<void>();
  @Output() testProgress = new EventEmitter<void>();

  collapsed = false;
  autoScroll = true;

  /* ============================================================================================ */
  ngAfterViewChecked(): void {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  /* ============================================================================================ */
  trackByIndex(index: number, item: string): number {
    return index;
  }

  /* ============================================================================================ */
  isRecentLog(index: number): boolean {
    return index >= this.logs.length - 3; // Tune as needed
  }

  /* ============================================================================================ */
  extractTimestamp(log: string): string {
    const match = log.match(/(\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : '';
  }

  /* ============================================================================================ */
  extractMessage(log: string): string {
    const parts = log.split(': ');
    return parts.length > 1 ? parts.slice(1).join(': ').trim() : log;
  }

  /* ============================================================================================ */
  getProgressPercentage(): number {
    if (this.progressTotal === 0) return 0;
    return Math.round((this.progressCurrent / this.progressTotal) * 100);
  }

  /* ============================================================================================ */
  exportLogs(): void {
    const logText = this.logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /* ============================================================================================ */
  private scrollToBottom(): void {
    const logsContainer = document.querySelector(".debug-logs");
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }
}
