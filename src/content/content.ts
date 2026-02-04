/**
 * Content Script
 * Runs in the context of the web page
 */

import memeMapData from '@core/meme-map.json';
import { MemeReplacer } from '@core/replacer';
import { DOMWalker } from '@core/dom-walker';
import { ContentScriptConfig, MemeMap } from '@core/types';

class ContentScriptManager {
  private replacer: MemeReplacer;
  private walker: DOMWalker;
  private observer: MutationObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private config: ContentScriptConfig;

  constructor(config: ContentScriptConfig) {
    this.config = config;
    this.replacer = new MemeReplacer(config.memeMap);
    this.walker = new DOMWalker(this.replacer);
  }

  /**
   * Initialize the content script
   */
  public init(): void {
    console.log('Meme Icon Extension: initializing', { enabled: this.config.enabled });

    // Always listen for messages, even if disabled
    this.listenForConfigUpdates();

    if (!this.config.enabled) {
      console.log('Meme Icon Extension: disabled, skipping DOM processing');
      return;
    }

    // Initial DOM walk
    this.walkDOM();

    // Setup mutation observer for dynamic content
    this.setupMutationObserver();
  }

  /**
   * Walk and process the DOM
   */
  private walkDOM(): void {
    try {
      const processed = this.walker.walkAndReplace(document.documentElement);
      if (processed > 0) {
        console.log(
          `Meme Icon Extension: processed ${processed} text nodes`
        );
      }
    } catch (error) {
      console.error('Meme Icon Extension: error during DOM walk', error);
    }
  }

  /**
   * Setup mutation observer for dynamic content
   */
  private setupMutationObserver(): void {
    const observerCallback = (): void => {
      // Debounce rapid mutations
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.walkDOM();
      }, this.config.debounceMs);
    };

    this.observer = new MutationObserver(observerCallback);

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: false,
    });
  }

  /**
   * Listen for configuration updates from background script
   */
  private listenForConfigUpdates(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
        if (request.type === 'UPDATE_CONFIG') {
          this.updateConfig(request.config);
          sendResponse({ status: 'config updated' });
          return true; // Keep channel open for async response
        } else if (request.type === 'REPROCESS_DOM') {
          this.walkDOM();
          sendResponse({ status: 'DOM reprocessed' });
          return true; // Keep channel open for async response
        }
        return false; // Close channel for unhandled messages
      });
    }
  }

  /**
   * Update configuration
   */
  private updateConfig(newConfig: ContentScriptConfig): void {
    this.config = newConfig;
    this.replacer.updateMemeMap(newConfig.memeMap);
    this.walkDOM();
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Initialize content script with storage configuration
const defaultConfig: ContentScriptConfig = {
  enabled: true,
  memeMap: memeMapData as MemeMap,
  excludeDomains: [],
  debounceMs: 300,
  maxReplacementsPerRun: 1000,
};

let manager: ContentScriptManager;

// Load config from storage first
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get('meme-icon-config', (result: any) => {
    const storageData = result['meme-icon-config'];
    const config = storageData?.config || defaultConfig;
    
    console.log('Meme Icon Extension: loaded config', { enabled: config.enabled });
    
    manager = new ContentScriptManager(config);
    manager.init();
  });
} else {
  // Fallback for non-extension context
  manager = new ContentScriptManager(defaultConfig);
  manager.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (manager) {
    manager.destroy();
  }
});
