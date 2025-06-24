import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from "@tauri-apps/api/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subject, takeUntil } from 'rxjs';
import { listen } from '@tauri-apps/api/event';

import { DirectorySelectorComponent } from './components/directory-selector/directory-selector.component';
import { UnusedReportComponent, UnusedReport } from './components/unused-report/unused-report.component';
import { ScanResultsComponent, ScanResult } from './components/scan-results/scan-results.component';
import { FooterComponent } from './components/footer/footer.component';
import { DebugWindowComponent } from './components/debug-window/debug-window.component';
import { ThemesService } from './services/themes/themes.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    DirectorySelectorComponent,
    UnusedReportComponent,
    ScanResultsComponent,
    FooterComponent,
    DebugWindowComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  selectedDirectory = "";
  searchWord = "";
  loading = false;
  currentAction: "unused" | "word" | "" = "";
  showResults = false;
  errorMessage = "";
  isDarkMode = false;

  // Progress
  progressCurrent = 0;
  progressTotal = 0;
  progressMessage = '';

  // Debug (will be removed in production)
  debugLogs: string[] = [];
  showDebugWindow = true;
  isDevelopment = !environment.production;

  unusedResults: UnusedReport | null = null;
  wordResults: ScanResult | null = null;

  expandedFiles = new Set<string>();
  private destroy$ = new Subject<void>();

  /* ============================================================================================ */
  constructor(
    private themeService: ThemesService,
    private cdr: ChangeDetectorRef
  ) {}

  /* ======================================== ng funtions ======================================= */
  async ngOnInit(): Promise<void> {
    this.logToDebug("[FRONTEND] App initializing");

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });

    if (this.isTauriAvailable()) {
      try {
        this.logToDebug("[FRONTEND] Setting up Tauri event listener");
        await listen('progress', async (event: any) => {
          this.logToDebug(`[FRONTEND] Progress event received: ${JSON.stringify(event.payload)}`);
          const { current, total, message } = event.payload;
          this.progressCurrent = current;
          this.progressTotal = total;
          this.progressMessage = message;

          this.cdr.detectChanges();
        });
        this.logToDebug("[FRONTEND] Tauri event listener setup complete");
      } catch (error) {
        this.logToDebug("[FRONTEND] Could not setup Tauri event listener");
      }
    } else {
      this.logToDebug("[FRONTEND] Tauri not available - running in web mode");
    }
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
    this.logToDebug(`[FRONTEND] Directory selected: ${directory}`);
  }

  /* ============================================================================================ */
  async findUnusedCssTags() {
    if (!this.selectedDirectory) return;

    this.logToDebug(`[FRONTEND] Starting unused CSS scan`);
    this.loading = true;
    this.currentAction = "unused";
    this.clearResults();
    this.clearError();
    this.resetProgress();

    try {
      this.logToDebug(`[FRONTEND] Invoking find_unused_css_tags comman`);
      this.unusedResults = await invoke<UnusedReport>("find_unused_css_tags", { 
        directory: this.selectedDirectory 
      });
      this.logToDebug(`[FRONTEND] Received results with ${this.unusedResults.total_classes} total classes`);
      this.showResults = true;
      
    } catch (error) {
      this.logToDebug(`[FRONTEND] Error: ${error}`);
      this.showError(`Failed to find unused CSS tags: ${error}`);

    } finally {
      this.logToDebug(`[FRONTEND] Cleaning up unused CSS scan`);
      this.loading = false;
      this.currentAction = '';
      this.resetProgress();
    }
  }

  /* ============================================================================================ */
  async findWordInFiles() {
    if (!this.selectedDirectory) return;

    this.loading = true;
    this.currentAction = "word";
    this.clearResults();
    this.clearError();
    this.resetProgress();

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
      this.resetProgress();
    }
  }

  /* ============================================================================================ */
  getProgressPercentage(): number {
    if (this.progressTotal === 0) return 0;
    return Math.round((this.progressCurrent / this.progressTotal) * 100);
  }

  /* ============================================================================================ */
  clearResults(): void {
    this.resetResultSection();
  }

  /* ============================================================================================ */
  resetResultSection(): void {
    this.unusedResults = null;
    this.wordResults = null;
    this.showResults = false;
    this.expandedFiles.clear();
  }

  /* ============================================================================================ */
  resetProgress(): void {
    this.progressCurrent = 0;
    this.progressTotal = 0;
    this.progressMessage = '';
  }

  /* ============================================================================================ */
  showError(message: string): void {
    this.errorMessage = message;
  }

  /* ============================================================================================ */
  clearError(): void {
    this.errorMessage = "";
  }

  /* ============================================================================================ */
  toggleDebugWindow(): void {
    this.showDebugWindow = !this.showDebugWindow;
    this.logToDebug(`[FRONTEND] Debug window ${this.showDebugWindow ? 'opened' : 'closed'}`);
  }

  /* ============================================================================================ */
  clearDebugLogs(): void {
    this.debugLogs = [];
  }

  /* ============================================================================================ */
  private isTauriAvailable(): boolean {
    return typeof window !== 'undefined' && 
           (window as any).__TAURI_INTERNALS__ !== undefined;
  }

  /* ============================================================================================ */
  private logToDebug(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    this.debugLogs.push(logMessage);

    // Keep only 100 latest entries
    if (this.debugLogs.length > 100) {
      this.debugLogs= this.debugLogs.slice(-100);
    }

    // Console.log(logMessage);
  }
}
