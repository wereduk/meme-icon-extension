/**
 * Storage Manager
 * Handles all Chrome storage operations
 */

export interface MemeSettings {
  enabled: boolean;
  darkMode: boolean;
  patterns: Record<string, boolean>;
  customMemes: { value: string; emoji: string }[];
  includeDomains: string[];
  excludeDomains: string[];
}

export interface Stats {
  total: number;
  perPattern: Record<string, number>;
}

export class StorageManager {
  /**
   * Get all settings
   */
  public async getSettings(): Promise<MemeSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        {
          enabled: true,
          darkMode: false,
          patterns: {},
          customMemes: [],
          includeDomains: [],
          excludeDomains: []
        },
        (items: any) => {
          resolve({
            enabled: items.enabled,
            darkMode: items.darkMode,
            patterns: items.patterns || {},
            customMemes: items.customMemes || [],
            includeDomains: items.includeDomains || [],
            excludeDomains: items.excludeDomains || []
          });
        }
      );
    });
  }

  /**
   * Save a setting
   */
  public async saveSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * Set pattern enabled/disabled
   */
  public async setPatternEnabled(pattern: string, enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.patterns[pattern] = enabled;
    return this.saveSetting('patterns', settings.patterns);
  }

  /**
   * Get statistics
   */
  public async getStats(): Promise<Stats> {
    return new Promise((resolve) => {
      chrome.storage.local.get('stats', (items: any) => {
        resolve(items.stats || { total: 0, perPattern: {} });
      });
    });
  }

  /**
   * Increment stat counter
   */
  public async incrementStat(pattern: string): Promise<void> {
    const stats = await this.getStats();
    stats.total += 1;
    stats.perPattern[pattern] = (stats.perPattern[pattern] || 0) + 1;
    return new Promise((resolve) => {
      chrome.storage.local.set({ stats }, () => resolve());
    });
  }

  /**
   * Reset statistics
   */
  public async resetStats(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ stats: { total: 0, perPattern: {} } }, () => resolve());
    });
  }

  /**
   * Reset to default settings
   */
  public async resetToDefault(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        chrome.storage.local.clear(() => {
          resolve();
        });
      });
    });
  }
}
