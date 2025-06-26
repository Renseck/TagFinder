import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { open } from '@tauri-apps/plugin-dialog';
import { LoggingService } from '../../services/logging/logging.service';

@Component({
  selector: 'app-directory-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './directory-selector.component.html',
  styleUrl: './directory-selector.component.css'
})
export class DirectorySelectorComponent {
  selectedDirectory = '';
  isSelecting = false;
  errorMessage = '';

  @Output() directorySelected = new EventEmitter<string>();

  /* ============================================================================================ */
  constructor(private logger: LoggingService) {}

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
        this.selectedDirectory = selected;
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
    this.selectedDirectory = '';
    this.directorySelected.emit('');
  }

  /* ============================================================================================ */
  private fallbackDirectorySelection(): void {
    const directory = prompt("Enter the full path to your project directory:");
    if (directory) {
      this.selectedDirectory = directory;
      this.directorySelected.emit(directory);
    }
  }
}
