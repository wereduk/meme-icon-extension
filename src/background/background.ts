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
    this.setupExtensionIcon();
  }

  /**
   * Load configuration from storage
   */
  private loadConfiguration(): void {
    const storageKey = 'meme-icon-config';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(storageKey, (result: any) => {
        if (result[storageKey]) {
          const storedData = result[storageKey];
          // Merge stored config with default to get new meme values
          const updatedConfig = {
            ...storedData.config,
            memeMap: this.defaultConfig.memeMap, // Always use latest meme-map
          };
          this.saveConfiguration(updatedConfig);
          console.log('Updated configuration with latest meme values');
        } else {
          console.log('Using default configuration');
          this.saveConfiguration(this.defaultConfig);
        }
      });
    }
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
  }
}

const manager = new BackgroundManager();
manager.init();
