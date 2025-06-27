import { Component, EventEmitter, OnDestroy, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { open } from '@tauri-apps/plugin-dialog';
import { LoggingService } from '../../services/logging/logging.service';
import { DirectoryService } from '../../services/directory/directory.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-directory-selector',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule
  ],
  templateUrl: './directory-selector.component.html',
  styleUrl: './directory-selector.component.css'
})
export class DirectorySelectorComponent implements OnInit, OnDestroy {
  selectedDirectory = '';
  isSelecting = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  @Output() directorySelected = new EventEmitter<string>();

  /* ============================================================================================ */
  constructor(
    private logger: LoggingService,
    private directoryService: DirectoryService
  ) {}

  /* ============================================================================================ */
  ngOnInit(): void {
      this.logger.debug("DIRECTORY_SELECTOR", "Component initialized");

      this.directoryService.selectedDirectory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(directory => {
        this.selectedDirectory = directory;
        // this.logger.debug('DIRECTORY_SELECTOR', `Directory updated from shared state: ${directory}`);
      });

      this.selectedDirectory = this.directoryService.getCurrentDirectory();
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  /* ============================================================================================ */
  async selectDirectory(): Promise<void> {
    this.logger.debug('DIRECTORY_SELECTOR', 'Opening directory dialog');
    this.isSelecting = true;
    this.errorMessage = '';

    try {
      
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Directory',
        defaultPath: this.selectedDirectory || undefined
      });

      if (selected && typeof selected === 'string') {
        this.directoryService.setSelectedDirectory(selected);
        this.directorySelected.emit(selected);
        this.logger.info('DIRECTORY_SELECTOR', `Directory selected: ${selected}`);
      }
    } catch (error) {
      this.logger.error('DIRECTORY_SELECTOR', 'Failed to open directory dialog', error);
      this.errorMessage = "Native file dialog not available. Using fallback.";
      
      // Fallback to prompt if dialog fails
      setTimeout(() => {
        this.fallbackDirectorySelection();
      }, 100);
    } finally {
      this.isSelecting = false;
    }
  }

  /* ============================================================================================ */
  getDirectoryName(): string {
    if (!this.selectedDirectory) return '';
    const parts = this.selectedDirectory.split(/[/\\]/);
    return parts[parts.length - 1] || this.selectedDirectory;
  }

  /* ============================================================================================ */
  clearDirectory(): void {
    this.logger.debug('DIRECTORY_SELECTOR', 'Clearing directory selection');
    this.directoryService.clearSelectedDirectory();
    this.directorySelected.emit('');
  }

  /* ============================================================================================ */
  private fallbackDirectorySelection(): void {
    const directory = prompt("Enter the full path to your project directory:");
    if (directory) {
      this.directoryService.setSelectedDirectory(directory);
      this.directorySelected.emit(directory);
    }
  }
}
