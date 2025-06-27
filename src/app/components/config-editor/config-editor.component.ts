import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { DirectorySelectorComponent } from '../directory-selector/directory-selector.component';
import { FolderTreeComponent } from '../folder-tree/folder-tree.component';
import { FileTypeSelectorComponent } from '../file-type-selector/file-type-selector.component';
import { CssExtensionSelectorComponent } from '../css-extension-selector/css-extension-selector.component';
import { ConfigService, ConfigData } from '../../services/config/config.service';
import { LoggingService } from '../../services/logging/logging.service';
import { DirectoryService } from '../../services/directory/directory.service';

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DirectorySelectorComponent,
    FolderTreeComponent,
    FileTypeSelectorComponent,
    CssExtensionSelectorComponent
  ],
  templateUrl: './config-editor.component.html',
  styleUrl: './config-editor.component.css'
})
export class ConfigEditorComponent implements OnInit, OnDestroy {
  config: ConfigData = {
    scan: {
      exclude_dirs: [],
      include_extensions: [],
      css_extensions: []
    }
  };

  projectPath = '';
  saving = false;
  private destroy$ = new Subject<void>();

  /* ============================================================================================ */
  constructor(
    private configService: ConfigService,
    private logger: LoggingService,
    private directoryService: DirectoryService,
    private snackBar: MatSnackBar
  ) {}

  /* ============================================================================================ */
  async ngOnInit() {
      this.logger.info('CONFIG_EDITOR', 'Component initialized');

      this.directoryService.selectedDirectory$
         .pipe(takeUntil(this.destroy$))
         .subscribe(directory => {
            this.projectPath = directory;
            // this.logger.debug('CONFIG_EDITOR', `Project path updated from shared state: ${directory}`);
      });

      this.projectPath = this.directoryService.getCurrentDirectory();

      await this.loadConfig();
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  /* ============================================================================================ */
  async loadConfig() {
    this.logger.debug('CONFIG_EDITOR', 'Loading configuration');
    try {
      this.config = await this.configService.loadConfig();
      this.logger.info('CONFIG_EDITOR', 'Configuration loaded successfully', this.config);
    } catch (error) {
      this.logger.error('CONFIG_EDITOR', 'Failed to load configuration', error);
      this.snackBar.open('Failed to load configuration', 'Close', { duration: 3000 });
    }
  }

  /* ============================================================================================ */
  onProjectDirectorySelected(directory: string) {
    this.directoryService.setSelectedDirectory(directory);
    // this.logger.info('CONFIG_EDITOR', `Project directory selected and shared: ${directory}`);
  }
  
  /* ============================================================================================ */
  onExcludedDirsChange(excludedDirs: string[]) {
    this.config.scan.exclude_dirs = excludedDirs;
    this.logger.debug('CONFIG_EDITOR', 'Excluded directories updated', excludedDirs);
  }

  /* ============================================================================================ */
  onIncludeExtensionsChange(extensions: string[]) {
    this.config.scan.include_extensions = extensions;
    this.logger.debug('CONFIG_EDITOR', 'Include extensions updated', extensions);
  }

  /* ============================================================================================ */
  onCssExtensionsChange(extensions: string[]) {
    this.config.scan.css_extensions = extensions;
    this.logger.debug('CONFIG_EDITOR', 'CSS extensions updated', extensions);
  }
  
  /* ============================================================================================ */
  async saveConfig() {
    this.logger.info('CONFIG_EDITOR', 'Saving configuration');
    this.saving = true;

    try {
      await this.configService.saveConfig(this.config);
      this.logger.info('CONFIG_EDITOR', 'Configuration saved successfully');

      this.snackBar.open('Configuration saved successfully!', 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      this.logger.error('CONFIG_EDITOR', 'Failed to save configuration', error);
      this.snackBar.open('Failed to save configuration', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });

    } finally {
      this.saving = false;
      this.logger.debug('CONFIG_EDITOR', 'Save operation finished');
    }
  }

  /* ============================================================================================ */
  resetToDefaults() {
    this.logger.info('CONFIG_EDITOR', 'Resetting configuration to defaults');
    this.config = {
      scan: {
        exclude_dirs: ["node_modules", "dist", ".git", ".vscode", ".idea", ".angular", "build", "target", "backend"],
        include_extensions: ["html", "js", "jsx", "ts", "tsx", "php"],
        css_extensions: ["css", "scss"]
      }
    };
    this.snackBar.open('Configuration reset to defaults', 'Close', { duration: 3000 });
  }
}
