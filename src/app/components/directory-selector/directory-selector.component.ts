import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { open } from '@tauri-apps/plugin-dialog';

@Component({
  selector: 'app-directory-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './directory-selector.component.html',
  styleUrl: './directory-selector.component.css'
})
export class DirectorySelectorComponent {
  selectedDirectory = '';
  isSelecting = false;
  errorMessage = '';

  @Output() directorySelected = new EventEmitter<string>();

  /* ============================================================================================ */
  async selectDirectory(): Promise<void> {
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
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
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
