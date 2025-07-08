import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { LoggingService } from '../logging/logging.service';

export interface ConfigData {
  scan: {
    exclude_dirs: string[];
    include_extensions: string[];
    css_extensions: string[];
  };
}

export interface DirectoryItem {
  name: string;
  path: string;
  is_directory: boolean;
  children?: DirectoryItem[];
  expanded?: boolean;
  excluded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private logger: LoggingService) { }

  /* ============================================================================================ */
  async loadConfig(): Promise<ConfigData> {
    this.logger.debug('CONFIG_SERVICE', 'Loading configuration from backend');

    try {
      const config = await invoke<ConfigData>('load_config');
      this.logger.info('CONFIG_SERVICE', 'Configuration loaded successfully');
      return config;
      
    } catch (error) {
      this.logger.error('CONFIG_SERVICE', 'Failed to load config from backend', error);
      // Return default config
      return {
        scan: {
          exclude_dirs: ["node_modules", "dist", ".git", ".vscode", ".idea", ".angular", "build", "target", "backend"],
          include_extensions: ["html", "js", "jsx", "ts", "tsx", "php", "rs"],
          css_extensions: ["css", "scss"]
        }
      };
    }
  }

  /* ============================================================================================ */
  async saveConfig(config: ConfigData): Promise<void> {
    this.logger.debug('CONFIG_SERVICE', 'Saving configuration to backend', config);
    try {
      await invoke('save_config', { config });
      this.logger.info('CONFIG_SERVICE', 'Configuration saved successfully');
    } catch(error) {
      this.logger.error('CONFIG_SERVICE', 'Failed to save config to backend', error);
      throw error;
    }
  }

  /* ============================================================================================ */
  async getDirectoryStructure(path: string): Promise<DirectoryItem[]> {
    this.logger.debug('CONFIG_SERVICE', `Getting directory structure for: ${path}`);
    try {
      return await invoke<DirectoryItem[]>('get_directory_structure', { path });
    } catch (error) {
      console.error('Failed to get directory structure:', error);
      throw error;
    }
  }

  /* ============================================================================================ */
  getCommonFileTypes(): string[] {
    return ['html', 'htm', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'php', 'rs'];
  }

  /* ============================================================================================ */
  getCommonCssTypes(): string[] {
    return ['css', 'scss', 'sass', 'less'];
  }
}
