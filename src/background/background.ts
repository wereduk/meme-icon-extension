/**
 * Background Service Worker
 * Handles extension lifecycle and communication
 */

import { ContentScriptConfig, MemeMap } from '@core/types';
import memeMapData from '@core/meme-map.json';

interface StorageData {
  config: ContentScriptConfig;
  lastUpdate: number;
}

class BackgroundManager {
  private defaultConfig: ContentScriptConfig;

  constructor() {
    this.defaultConfig = {
      enabled: true,
      memeMap: memeMapData as MemeMap,
      excludeDomains: [],
      includeDomains: [],
      debounceMs: 300,
      maxReplacementsPerRun: 1000,
    };
  }

  /**
   * Initialize background manager
   */
  public init(): void {
    console.log('Meme Icon Extension: background initialized');
    this.loadConfiguration();
    this.setupMessageListeners();
    this.setupStorageListeners();
    this.setupExtensionIcon();
  }

  /**
   * Load configuration from storage
   */
  private loadConfiguration(): void {
    const storageKey = 'meme-icon-config';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(storageKey, (result: any) => {
        const baseConfig = result[storageKey]?.config || this.defaultConfig;
        this.refreshConfigFromSettings(baseConfig);
      });
    }
  }

  /**
   * Listen for storage changes to sync settings
   */
  private setupStorageListeners(): void {
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && (changes.patterns || changes.enabled)) {
          this.refreshConfigFromSettings();
        }
      });
    }
  }

  /**
   * Get sync settings (enabled + patterns)
   */
  private async getSyncSettings(): Promise<{
    enabled: boolean;
    patterns: Record<string, boolean>;
    customMemes: { value: string; emoji: string }[];
    includeDomains: string[];
    excludeDomains: string[];
  }> {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve({
          enabled: true,
          patterns: {},
          customMemes: [],
          includeDomains: [],
          excludeDomains: [],
        });
        return;
      }

      chrome.storage.sync.get(
        {
          enabled: true,
          patterns: {},
          customMemes: [],
          includeDomains: [],
          excludeDomains: [],
        },
        (items: any) => {
        resolve({
          enabled: items.enabled !== false,
          patterns: items.patterns || {},
          customMemes: items.customMemes || [],
          includeDomains: items.includeDomains || [],
          excludeDomains: items.excludeDomains || [],
        });
      }
      );
    });
  }

  /**
   * Apply pattern settings to meme map
   */
  private applyPatternSettings(memeMap: MemeMap, patterns: Record<string, boolean>): MemeMap {
    return {
      ...memeMap,
      regexPatterns: memeMap.regexPatterns.map((pattern) => {
        const key = pattern.description || pattern.pattern;
        return {
          ...pattern,
          enabled: patterns[key] !== false,
        };
      }),
    };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildCustomPattern(value: string): string {
    const escaped = this.escapeRegex(value);
    if (/^\d+$/.test(value)) {
      return `(?<![.\\d-])${escaped}(?![.\\d-])`;
    }
    return `(?<!\\w)${escaped}(?!\\w)`;
  }

  private applyCustomMemes(memeMap: MemeMap, customMemes: { value: string; emoji: string }[]): MemeMap {
    if (!customMemes.length) {
      return memeMap;
    }

    const customValues: Record<string, string> = {};
    const customPatterns = customMemes.map((meme) => {
      const description = `custom:${meme.value}`;
      customValues[meme.value] = meme.emoji;
      return {
        pattern: this.buildCustomPattern(meme.value),
        replacement: meme.emoji,
        enabled: true,
        description,
      };
    });

    return {
      ...memeMap,
      values: {
        ...memeMap.values,
        ...customValues,
      },
      regexPatterns: [...memeMap.regexPatterns, ...customPatterns],
    };
  }

  /**
   * Refresh local config using sync settings
   */
  private async refreshConfigFromSettings(baseConfig?: ContentScriptConfig): Promise<void> {
    const settings = await this.getSyncSettings();
    const currentConfig = baseConfig || (await this.getConfiguration());
    const withCustom = this.applyCustomMemes(this.defaultConfig.memeMap, settings.customMemes);
    const withPatterns = this.applyPatternSettings(withCustom, settings.patterns);
    const updatedConfig: ContentScriptConfig = {
      ...currentConfig,
      enabled: settings.enabled,
      memeMap: withPatterns,
      includeDomains: settings.includeDomains,
      excludeDomains: settings.excludeDomains,
    };

    this.saveConfiguration(updatedConfig);
    this.broadcastConfigUpdate(updatedConfig);
  }

  /**
   * Save configuration to storage
   */
  private saveConfiguration(config: ContentScriptConfig): void {
    const storageKey = 'meme-icon-config';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const storageData: StorageData = {
        config,
        lastUpdate: Date.now(),
      };

      chrome.storage.local.set(
        { [storageKey]: storageData },
        () => {
          console.log('Configuration saved');
        }
      );
    }
  }

  /**
   * Setup message listeners from content scripts
   */
  private setupMessageListeners(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
        if (request.type === 'GET_CONFIG') {
          this.getConfiguration().then((config) => {
            sendResponse({ config });
          });
          return true; // Keep channel open for async response
        }

        if (request.type === 'UPDATE_CONFIG') {
          this.saveConfiguration(request.config);
          this.broadcastConfigUpdate(request.config);
          sendResponse({ status: 'saved' });
        }
      });
    }
  }

  /**
   * Get current configuration
   */
  private async getConfiguration(): Promise<ContentScriptConfig> {
    return new Promise((resolve) => {
      const storageKey = 'meme-icon-config';

      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(storageKey, (result: any) => {
          if (result[storageKey]) {
            resolve(result[storageKey].config);
          } else {
            resolve(this.defaultConfig);
          }
        });
      } else {
        resolve(this.defaultConfig);
      }
    });
  }

  /**
   * Broadcast configuration update to all tabs
   */
  private broadcastConfigUpdate(config: ContentScriptConfig): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({}, (tabs: any) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: 'UPDATE_CONFIG',
                config,
              },
              () => {
                // Ignore errors for inactive tabs
              }
            );
          }
        }
      });
    }
  }

  /**
   * Setup extension icon click handler
   */
  private setupExtensionIcon(): void {
    // Chrome MV3 uses chrome.action
    if (typeof chrome !== 'undefined' && chrome.action) {
      chrome.action.onClicked.addListener((tab: any) => {
        if (tab.id) {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'REPROCESS_DOM' },
            () => {
              console.log('DOM reprocessed');
            }
          );
        }
      });
    }
    // Firefox and Chrome MV2 use browserAction
    else if (typeof chrome !== 'undefined' && (chrome as any).browserAction) {
      (chrome as any).browserAction.onClicked.addListener((tab: any) => {
        if (tab.id) {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'REPROCESS_DOM' },
            () => {
              console.log('DOM reprocessed');
            }
          );
        }
      });
    }
  }
}

const manager = new BackgroundManager();
manager.init();
