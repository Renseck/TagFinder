import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

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

  constructor() { }

  /* ============================================================================================ */
  async loadConfig(): Promise<ConfigData> {
    try {
      return await invoke<ConfigData>('load_config');
    } catch (error) {
      console.error('Failed to load config:', error);
      // Return default config
      return {
        scan: {
          exclude_dirs: ["node_modules", "dist", ".git", ".vscode", ".idea", ".angular", "build", "target", "backend"],
          include_extensions: ["html", "js", "jsx", "ts", "tsx", "php"],
          css_extensions: ["css", "scss"]
        }
      };
    }
  }

  /* ============================================================================================ */
  async saveConfig(config: ConfigData): Promise<void> {
    try {
      await invoke('save_config', { config });
    } catch(error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /* ============================================================================================ */
  async getDirectoryStructure(path: string): Promise<DirectoryItem[]> {
    try {
      return await invoke<DirectoryItem[]>('get_directory_structure', { path });
    } catch (error) {
      console.error('Failed to get directory structure:', error);
      throw error;
    }
  }

  /* ============================================================================================ */
  getCommonFileTypes(): string[] {
    return ['html', 'htm', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'php'];
  }

  /* ============================================================================================ */
  getCommonCssTypes(): string[] {
    return ['css', 'scss', 'sass', 'less'];
  }
}
