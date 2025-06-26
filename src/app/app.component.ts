import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from "@tauri-apps/api/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subject, takeUntil } from 'rxjs';
import { listen } from '@tauri-apps/api/event';

import { ConfigEditorComponent } from './components/config-editor/config-editor.component';
import { DirectorySelectorComponent } from './components/directory-selector/directory-selector.component';
import { UnusedReportComponent, UnusedReport } from './components/unused-report/unused-report.component';
import { ScanResultsComponent, ScanResult } from './components/scan-results/scan-results.component';
import { FooterComponent } from './components/footer/footer.component';
import { DebugWindowComponent } from './components/debug-window/debug-window.component';
import { ThemesService } from './services/themes/themes.service';
import { LoggingService } from './services/logging/logging.service';
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
    DebugWindowComponent,
    ConfigEditorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  currentView: 'main' | 'config' = 'main';

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
    private cdr: ChangeDetectorRef,
    private logger: LoggingService
  ) {}

  /* ======================================== ng funtions ======================================= */
  async ngOnInit(): Promise<void> {
    this.logger.info('APP', 'Application initializing');

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });

    if (this.isTauriAvailable()) {
      try {
        this.logger.debug('APP', 'Setting up Tauri event listener');
        await listen('progress', async (event: any) => {
          this.logger.debug('BACKEND', 'Progress event received', event.payload);
          const { current, total, message } = event.payload;
          this.progressCurrent = current;
          this.progressTotal = total;
          this.progressMessage = message;

          this.cdr.detectChanges();
        });
        this.logger.info('APP', 'Tauri event listener setup complete');
      } catch (error) {
        this.logger.error('APP', 'Could not setup Tauri event listener', error);
      }
    } else {
      this.logger.warn('APP', 'Tauri not available - running in web mode');
    }
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  /* ============================================================================================ */
  onDirectorySelected(directory: string): void {
    this.selectedDirectory = directory;
    this.logger.info('APP', `Directory selected: ${directory}`);

    // Clear previous results when directory changes
    if (this.showResults) {
      this.clearResults();
      this.logger.debug('APP', 'Cleared previous results due to directory change');
    }
  }

  /* ============================================================================================ */
  async findUnusedCssTags() {
    if (!this.selectedDirectory) return;

    this.logger.info('APP', 'Starting unused CSS scan');
    this.loading = true;
    this.currentAction = "unused";
    this.clearResults();
    this.clearError();
    this.resetProgress();

    try {
      this.logger.debug('APP', 'Invoking find_unused_css_tags command');
      this.unusedResults = await invoke<UnusedReport>("find_unused_css_tags", { 
        directory: this.selectedDirectory 
      });
      this.logger.info('APP', `Received results with ${this.unusedResults.total_classes} total classes`);
      this.showResults = true;
      
    } catch (error) {
      this.logger.error('APP', 'Unused CSS scan failed', error);
      this.showError(`Failed to find unused CSS tags: ${error}`);

    } finally {
      this.logger.debug('APP', 'Cleaning up unused CSS scan');
      this.loading = false;
      this.currentAction = '';
      this.resetProgress();
    }
  }

  /* ============================================================================================ */
  async findWordInFiles() {
    if (!this.selectedDirectory) return;

    this.logger.info('APP', `Starting word search for "${this.searchWord}"`);
    this.loading = true;
    this.currentAction = "word";
    this.clearResults();
    this.clearError();
    this.resetProgress();

    try {
      this.logger.debug('APP', 'Invoking find_word_in_files command');
      this.wordResults = await invoke<ScanResult>("find_word_in_files", { 
        word: this.searchWord,
        directory: this.selectedDirectory 
      });
      
      this.showResults = true;
      this.logger.info('APP', 'Word search completed successfully', this.wordResults);

    } catch (error) {
      this.logger.error('APP', 'Word search failed', error);
      this.showError(`Failed to search for word: ${error}`);

    } finally {
      this.logger.debug('APP', 'Cleaning up word search');
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
    this.logger.error('APP', `Error displayed to user: ${message}`);
  }

  /* ============================================================================================ */
  clearError(): void {
    this.errorMessage = "";
  }

  /* ============================================================================================ */
  clearDebugLogs(): void {
    this.logger.clearLogs();
    this.debugLogs = [];
  }

  /* ============================================================================================ */
  toggleDebugWindow(): void {
    this.showDebugWindow = !this.showDebugWindow;
    this.logger.debug('APP', `Debug window ${this.showDebugWindow ? 'opened' : 'closed'}`);
  }

  /* ============================================================================================ */
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.logger.info('APP', `Theme toggled to ${this.isDarkMode ? 'dark' : 'light'} mode`);
  }

  /* ============================================================================================ */
  showMainView() {
    this.currentView = 'main';
    this.logger.debug('APP', 'Switched to main view');
  }

  /* ============================================================================================ */
  showConfigView() {
    this.currentView = 'config';
    this.logger.debug('APP', 'Switched to config view');
  }

  /* ============================================================================================ */
  private isTauriAvailable(): boolean {
    return typeof window !== 'undefined' && 
           (window as any).__TAURI_INTERNALS__ !== undefined;
  }
}
