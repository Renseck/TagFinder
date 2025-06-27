import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DirectoryItem } from '../../../services/config/config.service';

@Component({
  selector: 'app-folder-tree-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './folder-tree-item.component.html',
  styleUrl: './folder-tree-item.component.css'
})
export class FolderTreeItemComponent {
  @Input() item!: DirectoryItem;
  @Input() excludedDirs: string[] = [];
  @Output() toggleExcluded = new EventEmitter<DirectoryItem>();
  @Output() toggleExpanded = new EventEmitter<DirectoryItem>();

  /* ============================================================================================ */
  onToggleExcluded(event: Event) {
    event.stopPropagation(); // Prevent event bubbling
    this.toggleExcluded.emit(this.item);
  }

  /* ============================================================================================ */
  onToggleExpanded(event: Event) {
    event.stopPropagation(); // Prevent event bubbling
    this.toggleExpanded.emit(this.item);
  }

  /* ============================================================================================ */
  onChildToggleExcluded(item: DirectoryItem) {
    this.toggleExcluded.emit(item);
  }

  /* ============================================================================================ */
  onChildToggleExpanded(item: DirectoryItem) {
    this.toggleExpanded.emit(item);
  }
  
}

