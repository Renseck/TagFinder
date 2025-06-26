import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { DirectoryItem, ConfigService } from '../../services/config/config.service';
import { FolderTreeItemComponent } from './folder-tree-item/folder-tree-item.component';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FolderTreeItemComponent
  ],
  templateUrl: './folder-tree.component.html',
  styleUrl: './folder-tree.component.css'
})
export class FolderTreeComponent implements OnChanges{
  @Input() projectPath: string = '';
  @Input() excludedDirs: string[] = [];
  @Output() excludedDirsChange = new EventEmitter<string[]>();

  directoryItems: DirectoryItem[] = [];
  loading = false;

  /* ============================================================================================ */
  constructor(private configService: ConfigService) {}

  /* ============================================================================================ */
  async ngOnChanges(changes: SimpleChanges) {
      if (changes['projectPath'] && this.projectPath) {
        await this.loadDirectoryStructure();
      }
  }

  /* ============================================================================================ */
  async loadDirectoryStructure() {
    if (!this.projectPath) return;

    this.loading = true;
    try {
      this.directoryItems = await this.configService.getDirectoryStructure(this.projectPath);
      this.markExcludedDirectories(this.directoryItems);
    } catch (error) {
      console.error("Failed to load directory structure", error);
    } finally {
      this.loading = false;
    }
  }

  /* ============================================================================================ */
  private markExcludedDirectories(items: DirectoryItem[]) {
    for (const item of items) {
      item.excluded = this.excludedDirs.includes(item.name);
      if (item.children) {
        this.markExcludedDirectories(item.children);
      }
    }
  }

  /* ============================================================================================ */
  onToggleExcluded(item: DirectoryItem) {
    const newExcludedDirs = [...this.excludedDirs];
    const index = newExcludedDirs.indexOf(item.name);

    if (index > - 1) {
      newExcludedDirs.splice(index, 1);
    } else {
      newExcludedDirs.push(item.name);
    }

    this.excludedDirsChange.emit(newExcludedDirs);
  }

  /* ============================================================================================ */
  onToggleExpanded(item: DirectoryItem) {
    item.expanded = !item.expanded;
  }

}
