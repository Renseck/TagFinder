import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CssClass {
  name: string;
  file: string;
  line: number;
}

export interface UnusedClass {
  class: CssClass;
  is_unused: boolean;
}

export interface UnusedReport {
  total_classes: number;
  unused_classes: CssClass[];
  used_classes: CssClass[];
  by_file: Record<string, UnusedClass[]>;
}


@Component({
  selector: 'app-unused-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unused-report.component.html',
  styleUrl: './unused-report.component.css'
})
export class UnusedReportComponent {
  @Input() report: UnusedReport | null = null;
  
  private expandedFiles = new Set<string>();

  /* ============================================================================================ */
  getFilesWithUnused(): string[] {
    if (!this.report?.by_file) return [];
    return Object.keys(this.report.by_file)
      .filter(file => this.getUnusedClassesForFile(file).length > 0)
      .sort();
  }

  /* ============================================================================================ */
  getUnusedClassesForFile(filePath: string): UnusedClass[] {
    if (!this.report?.by_file[filePath]) return [];
    return this.report.by_file[filePath].filter(item => item.is_unused);
  }

  /* ============================================================================================ */
  toggleFile(filePath: string): void {
    if (this.expandedFiles.has(filePath)) {
      this.expandedFiles.delete(filePath);
    } else {
      this.expandedFiles.add(filePath);
    }
  }

  /* ============================================================================================ */
  isFileExpanded(filePath: string): boolean {
    return this.expandedFiles.has(filePath);
  }

  /* ============================================================================================ */
  getFileName(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || filePath;
  }
}
