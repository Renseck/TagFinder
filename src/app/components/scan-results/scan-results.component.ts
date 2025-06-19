import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ScanResult {
  css_files: string[];
  other_files: string[];
  is_css_only: boolean;
}

@Component({
  selector: 'app-scan-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-results.component.html',
  styleUrl: './scan-results.component.css'
})
export class ScanResultsComponent {
  @Input() result: ScanResult | null = null;
  @Input() searchWord: string = '';

  /* ============================================================================================ */
  getTotalMatches(): number {
    return (this.result?.css_files?.length || 0) + (this.result?.other_files?.length || 0);
  }

  /* ============================================================================================ */
  getAllFiles(): string[] {
    const cssFiles = this.result?.css_files || [];
    const otherFiles = this.result?.other_files || [];
    return [...cssFiles, ...otherFiles].sort();
  }

  /* ============================================================================================ */
  getFileType(filePath: string): 'css' | 'other' {
    if (this.result?.css_files?.includes(filePath)) return 'css';
    return 'other';
  }

  /* ============================================================================================ */
  getFileName(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || filePath;
  }
}
