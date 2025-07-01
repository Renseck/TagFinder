import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-debug-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './debug-actions.component.html',
  styleUrl: './debug-actions.component.css'
})
export class DebugActionsComponent {
  @Input() logCount: number = 0;
  @Input() collapsed: boolean = false;
  @Input() autoScroll: boolean = true;
  @Input() showLogLevel: boolean = true;
  @Input() canExport: boolean = false;

  @Output() clearLogs = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() toggleAutoScroll = new EventEmitter<void>();
  @Output() toggleShowLogLevel = new EventEmitter<void>();
  @Output() exportLogs = new EventEmitter<void>();

  /* ============================================================================================ */
  onClearLogs(): void {
    this.clearLogs.emit();
  }

  /* ============================================================================================ */
  onToggleCollapsed(): void {
    this.toggleCollapsed.emit();
  }

  /* ============================================================================================ */
  onToggleAutoScroll(): void {
    this.toggleAutoScroll.emit();
  }

  /* ============================================================================================ */
  onToggleShowLogLevel(): void {
    this.toggleShowLogLevel.emit();
  }

  /* ============================================================================================ */
  onExportLogs(): void {
    this.exportLogs.emit();
  }
}
