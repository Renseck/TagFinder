import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DirectorySelectorComponent } from '../directory-selector/directory-selector.component';
import { FolderTreeComponent } from '../folder-tree/folder-tree.component';
import { FileTypeSelectorComponent } from '../file-type-selector/file-type-selector.component';
import { CssExtensionSelectorComponent } from '../css-extension-selector/css-extension-selector.component';
import { ConfigService, ConfigData } from '../../services/config/config.service';

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
export class ConfigEditorComponent implements OnInit {
  config: ConfigData = {
    scan: {
      exclude_dirs: [],
      include_extensions: [],
      css_extensions: []
    }
  };

  projectPath = '';
  saving = false;

  /* ============================================================================================ */
  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {}

  /* ============================================================================================ */
  async ngOnInit() {
      await this.loadConfig();
  }

  /* ============================================================================================ */
  async loadConfig() {
    try {
      this.config = await this.configService.loadConfig();
    } catch (error) {
      console.error('Failed to load config', error);
      this.snackBar.open('Failed to load configuration', 'Close', { duration: 3000 });
    }
  }

  /* ============================================================================================ */
  onProjectDirectorySelected(directory: string) {
    this.projectPath = directory;
  }
  
  /* ============================================================================================ */
  onExcludedDirsChange(excludedDirs: string[]) {
    this.config.scan.exclude_dirs = excludedDirs;
  }

  /* ============================================================================================ */
  onIncludeExtensionsChange(extensions: string[]) {
    this.config.scan.include_extensions = extensions;
  }

  /* ============================================================================================ */
  onCssExtensionsChange(extensions: string[]) {
    this.config.scan.css_extensions = extensions;
  }
  
  /* ============================================================================================ */
  async saveConfig() {
    this.saving = true;
    try {
      await this.configService.saveConfig(this.config);
      this.snackBar.open('Configuration saved successfully!', 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      this.snackBar.open('Failed to save configuration', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.saving = false;
    }
  }

  /* ============================================================================================ */
  resetToDefaults() {
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
