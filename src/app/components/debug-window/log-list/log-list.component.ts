import { Component, Input, Output, EventEmitter, AfterViewChecked, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntryComponent, LogEntryData } from '../log-entry/log-entry.component';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [
    CommonModule,
    LogEntryComponent
  ],
  templateUrl: './log-list.component.html',
  styleUrl: './log-list.component.css'
})
export class LogListComponent implements AfterViewChecked {
  @Input() logs: LogEntryData[] = [];
  @Input() showLogLevel: boolean = true;
  @Input() autoScroll: boolean = true;
  @Input() collapsed: boolean = false;

  /* ============================================================================================ */
  constructor(private elementRef: ElementRef) {}

  /* ============================================================================================ */
  ngAfterViewChecked(): void {
      if (this.autoScroll && !this.collapsed) {
        this.scrollToBottom();
      }
      this.updateRecentHighlights();
  }

  /* ============================================================================================ */
  isRecentLog(index: number): boolean {
    return index >= this.logs.length - 3; // Tune as needed
  }

  /* ============================================================================================ */
  trackByLog(index: number, item: LogEntryData): string {
    return `${item.timestamp}-${item.component}-${item.message}`;
  }

  /* ============================================================================================ */
  private scrollToBottom(): void {
    const logsContainer = document.querySelector(".debug-logs");
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }

  /* ============================================================================================ */
   private updateRecentHighlights(): void {
    // Add special class to recent entries for enhanced hover effect
    const logEntries = this.elementRef.nativeElement.querySelectorAll('app-log-entry');
    const totalEntries = logEntries.length;
    
    logEntries.forEach((entry: HTMLElement, index: number) => {
      if (index >= totalEntries - 3) {
        entry.classList.add('recent-entry');
      } else {
        entry.classList.remove('recent-entry');
      }
    });
  }
}
