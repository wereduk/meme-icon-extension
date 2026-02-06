/**
 * Popup UI Logic
 * Handles user interactions and communication with background script
 */

import type { MemeMap, RegexPattern } from '@core/types';

interface StorageData {
  config: {
    enabled: boolean;
    memeMap: MemeMap;
  };
  lastUpdate: number;
}

class PopupManager {
  private enableToggle: HTMLInputElement | null = null;
  private statusText: HTMLElement | null = null;
  private memeList: HTMLElement | null = null;
  private memeCount: HTMLElement | null = null;
  private replacementCount: HTMLElement | null = null;
  private resetButton: HTMLElement | null = null;
  private testButton: HTMLElement | null = null;
  private notification: HTMLElement | null = null;
  private themeToggle: HTMLButtonElement | null = null;

  constructor() {
    this.initializeElements();
    this.initTheme();
  }

  /**
   * Initialize Dark Mode
   */
  private initTheme(): void {
    this.themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
    
    // Load saved theme preference
    chrome.storage.sync.get('darkMode', (result: any) => {
      const isDark = result.darkMode === true;
      this.applyTheme(isDark);
    });

    // Setup theme toggle
    this.themeToggle?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.applyTheme(!isDark);
      chrome.storage.sync.set({ darkMode: !isDark });
    });

    // Watch for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!chrome.storage.sync.get('darkMode')) {
          this.applyTheme(e.matches);
        }
      });
    }
  }

  /**
   * Apply theme
   */
  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.setAttribute('data-theme', 'dark');
      if (this.themeToggle) {
        this.themeToggle.textContent = '☀️';
      }
    } else {
      htmlElement.removeAttribute('data-theme');
      if (this.themeToggle) {
        this.themeToggle.textContent = '🌙';
      }
    }
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    this.enableToggle = document.getElementById(
      'enableToggle'
    ) as HTMLInputElement;
    this.statusText = document.getElementById('statusText');
    this.memeList = document.getElementById('memeList');
    this.memeCount = document.getElementById('memeCount');
    this.replacementCount = document.getElementById('replacementCount');
    this.resetButton = document.getElementById('resetButton');
    this.testButton = document.getElementById('testButton');
    this.notification = document.getElementById('notification');
  }

  /**
   * Initialize popup
   */
  public init(): void {
    this.loadConfiguration();
    this.setupEventListeners();
    this.loadMemeValues();
  }

  /**
   * Load configuration from storage
   */
  private loadConfiguration(): void {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      this.showNotification('Extension API not available', 'error');
      return;
    }

    chrome.storage.local.get('meme-icon-config', (result: any) => {
      const data = result['meme-icon-config'] as StorageData | undefined;

      if (data && this.enableToggle) {
        this.enableToggle.checked = data.config.enabled;
        this.updateStatusText();
      }
    });
  }

  /**
   * Load and display meme values
   */
  private loadMemeValues(): void {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return;
    }

    chrome.storage.local.get('meme-icon-config', (result: any) => {
      const data = result['meme-icon-config'] as StorageData | undefined;

      if (
        data &&
        data.config.memeMap &&
        data.config.memeMap.regexPatterns &&
        this.memeList
      ) {
        const patterns = data.config.memeMap.regexPatterns;
        const values = data.config.memeMap.values || {};

        chrome.storage.sync.get({ patterns: {} }, (syncData: any) => {
          const patternSettings = syncData.patterns || {};

          // Clear previous content
          this.memeList!.innerHTML = '';

          // Build HTML safely
          patterns.forEach((pattern: RegexPattern) => {
            const memeItem = document.createElement('div');
            memeItem.className = 'meme-item';

            const info = document.createElement('div');
            info.className = 'meme-item-info';

            const keySpan = document.createElement('span');
            keySpan.className = 'meme-key';
            keySpan.textContent = this.getValueLabel(pattern.replacement, values, pattern);

            const arrow = document.createElement('span');
            arrow.className = 'meme-arrow';
            arrow.textContent = '→';

            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'meme-emoji';
            emojiSpan.textContent = pattern.replacement;

            info.appendChild(keySpan);
            info.appendChild(arrow);
            info.appendChild(emojiSpan);

            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.className = 'meme-toggle';

            const settingKey = pattern.description || pattern.pattern;
            toggle.dataset.pattern = settingKey;
            toggle.checked = patternSettings[settingKey] !== false;

            toggle.addEventListener('change', () => {
              patternSettings[settingKey] = toggle.checked;
              chrome.storage.sync.set({ patterns: patternSettings }, () => {
                this.showNotification('Pattern updated', 'success');
              });
            });

            memeItem.appendChild(info);
            memeItem.appendChild(toggle);
            this.memeList!.appendChild(memeItem);
          });

          if (this.memeCount) {
            this.memeCount.textContent = patterns.length.toString();
          }
        });
      }
    });
  }

  /**
   * Get a human-readable label for a meme item
   */
  private getValueLabel(
    replacement: string,
    values: Record<string, string>,
    pattern: { description?: string; pattern: string }
  ): string {
    if (pattern.description?.startsWith('custom:')) {
      return pattern.description.replace('custom:', '');
    }
    const match = Object.entries(values).find(([, emoji]) => emoji === replacement);
    if (match) {
      return match[0];
    }
    return pattern.description || pattern.pattern;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (this.enableToggle) {
      this.enableToggle.addEventListener('change', () =>
        this.handleToggleChange()
      );
    }

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.handleReset());
    }

    if (this.testButton) {
      this.testButton.addEventListener('click', () => this.handleTest());
    }

    const settingsLink = document.getElementById('settingsLink');
    settingsLink?.addEventListener('click', (event) => {
      event.preventDefault();
      if (chrome?.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });
  }

  /**
   * Handle extension enable/disable toggle
   */
  private handleToggleChange(): void {
    if (!this.enableToggle || typeof chrome === 'undefined') {
      return;
    }

    const enabled = this.enableToggle.checked;

    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ enabled });
    }

    chrome.storage.local.get('meme-icon-config', (result: any) => {
      const data = result['meme-icon-config'] as StorageData | undefined;

      if (data) {
        data.config.enabled = enabled;
        chrome.storage.local.set(
          { 'meme-icon-config': data },
          () => {
            this.updateStatusText();
            const status = enabled ? 'enabled' : 'disabled';
            this.showNotification(
              `Extension ${status}`,
              'success'
            );
          }
        );
      }
    });
  }

  /**
   * Handle reset button
   */
  private handleReset(): void {
    if (typeof chrome === 'undefined') {
      return;
    }

    // Broadcast message to all tabs to reprocess DOM
    chrome.tabs.query({}, (tabs: any) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'REPROCESS_DOM' },
            () => {
              // Ignore errors
            }
          );
        }
      }
    });

    this.showNotification('DOM reprocessed on all pages', 'success');
  }

  /**
   * Handle test replacement
   */
  private handleTest(): void {
    if (!this.testButton || typeof chrome === 'undefined') {
      return;
    }

    // Get current tab and test replacement
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'REPROCESS_DOM' },
          (response: any) => {
            if (response && response.status) {
              this.showNotification('Test replacement completed', 'success');
            } else {
              this.showNotification('Could not test on this page', 'error');
            }
          }
        );
      }
    });
  }

  /**
   * Update status text based on toggle state
   */
  private updateStatusText(): void {
    if (!this.statusText || !this.enableToggle) {
      return;
    }

    if (this.enableToggle.checked) {
      this.statusText.textContent = 'Active';
      this.statusText.className = 'status enabled';
    } else {
      this.statusText.textContent = 'Disabled';
      this.statusText.className = 'status';
    }
  }

  /**
   * Show notification message
   */
  private showNotification(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    if (!this.notification) {
      return;
    }

    this.notification.className = type;
    this.notification.textContent = message;
    this.notification.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
      if (this.notification) {
        this.notification.style.display = 'none';
      }
    }, 4000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const popup = new PopupManager();
    popup.init();
  });
} else {
  const popup = new PopupManager();
  popup.init();
}
