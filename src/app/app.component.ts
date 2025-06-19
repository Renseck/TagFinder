import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { invoke } from "@tauri-apps/api/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subject, takeUntil } from 'rxjs';

import { DirectorySelectorComponent } from './components/directory-selector/directory-selector.component';
import { UnusedReportComponent, UnusedReport } from './components/unused-report/unused-report.component';
import { ScanResultsComponent, ScanResult } from './components/scan-results/scan-results.component';
import { ThemesService } from './services/themes/themes.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    DirectorySelectorComponent,
    UnusedReportComponent,
    ScanResultsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  selectedDirectory = "";
  searchWord = "";
  loading = false;
  currentAction: "unused" | "word" | "" = "";
  showResults = false;
  errorMessage = "";
  isDarkMode = false;

  unusedResults: UnusedReport | null = null;
  wordResults: ScanResult | null = null;

  expandedFiles = new Set<string>();
  private destroy$ = new Subject<void>();

  /* ============================================================================================ */
  constructor(private themeService: ThemesService) {}

  /* ======================================== ng funtions ======================================= */
  ngOnInit(): void {
      this.themeService.isDarkMode$
        .pipe(takeUntil(this.destroy$))
        .subscribe(isDark => {
          this.isDarkMode = isDark;
        })
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  /* ============================================================================================ */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  /* ============================================================================================ */
  onDirectorySelected(directory: string): void {
    this.selectedDirectory = directory;
  }

  /* ============================================================================================ */
  async findUnusedCssTags() {
    if (!this.selectedDirectory) return;

    this.loading = true;
    this.currentAction = "unused";
    this.clearResults();
    this.clearError();

    try {
      this.unusedResults = await invoke<UnusedReport>("find_unused_css_tags", { 
        directory: this.selectedDirectory 
      });
      this.showResults = true;
      console.log("Unused CSS report:", this.unusedResults);
    } catch (error) {
      console.error("Error finding unused CSS tags:", error);
      this.showError(`Failed to find unused CSS tags: ${error}`);
    } finally {
      this.loading = false;
      this.currentAction = '';
    }
  }

  /* ============================================================================================ */
  async findWordInFiles() {
    if (!this.selectedDirectory) return;

    this.loading = true;
    this.currentAction = "word";
    this.clearResults();
    this.clearError();

    try {
      this.wordResults = await invoke<ScanResult>("find_word_in_files", { 
        word: this.searchWord,
        directory: this.selectedDirectory 
      });
      this.showResults = true;
      console.log("Word search result:", this.wordResults);
    } catch (error) {
      console.error("Error finding word:", error);
      this.showError(`Failed to search for word: ${error}`);
    } finally {
      this.loading = false;
      this.currentAction = '';
    }
  }

  /* ============================================================================================ */
  clearResults(): void {
    this.unusedResults = null;
    this.wordResults = null;
    this.showResults = false;
    this.expandedFiles.clear();
  }

  /* ============================================================================================ */
  showError(message: string): void {
    this.errorMessage = message;
  }

  /* ============================================================================================ */
  clearError(): void {
    this.errorMessage = "";
  }
}
