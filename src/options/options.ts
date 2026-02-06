import { StorageManager } from '../core/storage';
import type { MemeSettings } from '../core/types';
import memeMap from '../core/meme-map.json';

class OptionsPage {
  private storageManager: StorageManager;

  constructor() {
    this.storageManager = new StorageManager();
    this.init();
  }

  private async init(): Promise<void> {
    console.log('Options page initializing...');
    
    // Load theme preference
    const { darkMode } = await this.storageManager.getSettings();
    this.applyTheme(darkMode);

    // Setup event listeners
    this.setupEventListeners();

    // Load meme mappings
    await this.loadMemeList();

    // Load custom memes
    await this.loadCustomMemes();

    // Load domain rules
    await this.loadDomainRules();

    // Load statistics
    await this.updateStatistics();
  }

  private setupEventListeners(): void {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
    themeToggle?.addEventListener('change', async (e) => {
      const isDark = (e.target as HTMLInputElement).checked;
      this.applyTheme(isDark);
      await this.storageManager.saveSetting('darkMode', isDark);
      this.showSaveStatus('Theme saved');
    });

    // Extension toggle
    const extensionToggle = document.getElementById('extension-enabled') as HTMLInputElement;
    extensionToggle?.addEventListener('change', async (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      await this.storageManager.saveSetting('enabled', enabled);
      await this.updateStatistics();
      this.showSaveStatus('Setting saved');
    });

    // Enable all memes
    document.getElementById('enable-all')?.addEventListener('click', async () => {
      const toggles = document.querySelectorAll('.meme-toggle') as NodeListOf<HTMLInputElement>;
      toggles.forEach(toggle => {
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change'));
      });
    });

    // Disable all memes
    document.getElementById('disable-all')?.addEventListener('click', async () => {
      const toggles = document.querySelectorAll('.meme-toggle') as NodeListOf<HTMLInputElement>;
      toggles.forEach(toggle => {
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
      });
    });

    // Reset stats button
    document.getElementById('reset-stats')?.addEventListener('click', async () => {
      if (confirm('Reset all statistics?')) {
        await this.storageManager.resetStats();
        await this.updateStatistics();
        this.showSaveStatus('Statistics reset');
      }
    });

    // Reset all button
    document.getElementById('reset-all')?.addEventListener('click', async () => {
      if (confirm('Reset all settings to default? This cannot be undone.')) {
        await this.storageManager.resetToDefault();
        location.reload();
      }
    });

    // Export/Import buttons
    document.getElementById('export-settings')?.addEventListener('click', () => {
      this.exportSettings();
    });

    document.getElementById('import-settings')?.addEventListener('click', () => {
      this.importSettings();
    });

    // Add custom meme
    document.getElementById('add-custom-meme')?.addEventListener('click', async () => {
      const valueInput = document.getElementById('custom-value') as HTMLInputElement | null;
      const emojiInput = document.getElementById('custom-emoji') as HTMLInputElement | null;

      const value = valueInput?.value.trim() || '';
      const emoji = emojiInput?.value.trim() || '';

      if (!value || !emoji) {
        alert('Please provide both value and emoji');
        return;
      }

      const settings = await this.storageManager.getSettings();
      const updated = [...settings.customMemes, { value, emoji }];
      await this.storageManager.saveSetting('customMemes', updated);

      if (valueInput) valueInput.value = '';
      if (emojiInput) emojiInput.value = '';

      await this.loadCustomMemes();
      this.showSaveStatus('Custom meme added');
    });

    // Domain mode toggle
    const domainModeRadios = document.querySelectorAll('input[name="domain-mode"]') as NodeListOf<HTMLInputElement>;
    domainModeRadios.forEach((radio) => {
      radio.addEventListener('change', async (e) => {
        const mode = (e.target as HTMLInputElement).value;
        const blacklistSection = document.getElementById('blacklist-section') as HTMLElement;
        const whitelistSection = document.getElementById('whitelist-section') as HTMLElement;

        if (mode === 'blacklist') {
          blacklistSection.style.display = 'block';
          whitelistSection.style.display = 'none';
        } else {
          blacklistSection.style.display = 'none';
          whitelistSection.style.display = 'block';
        }

        // Save the mode preference
        await this.storageManager.saveSetting('domainMode', mode as 'blacklist' | 'whitelist');
      });
    });

    // Save domain rules
    document.getElementById('save-domain-rules')?.addEventListener('click', async () => {
      const includeEl = document.getElementById('include-domains') as HTMLTextAreaElement | null;
      const excludeEl = document.getElementById('exclude-domains') as HTMLTextAreaElement | null;

      const includeDomains = this.parseDomainList(includeEl?.value || '');
      const excludeDomains = this.parseDomainList(excludeEl?.value || '');

      await this.storageManager.saveSetting('includeDomains', includeDomains);
      await this.storageManager.saveSetting('excludeDomains', excludeDomains);
      this.showSaveStatus('Domain rules saved');
    });

    // Reset domain rules
    document.getElementById('reset-domain-rules')?.addEventListener('click', async () => {
      if (confirm('Clear all domain rules?')) {
        await this.storageManager.saveSetting('includeDomains', []);
        await this.storageManager.saveSetting('excludeDomains', []);
        await this.loadDomainRules();
        this.showSaveStatus('Domain rules cleared');
      }
    });
  }

  private async loadMemeList(): Promise<void> {
    const container = document.getElementById('meme-list');
    if (!container) return;

    const { patterns } = await this.storageManager.getSettings();
    container.innerHTML = '';

    memeMap.regexPatterns.forEach((pattern) => {
      const item = document.createElement('div');
      item.className = 'meme-item';

      const isEnabled = patterns[pattern.description] !== false;

      item.innerHTML = `
        <div class="meme-item-content">
          <div class="meme-item-info">
            <span class="meme-pattern">${this.escapeHtml(pattern.pattern)}</span>
            <span class="meme-replacement">${pattern.replacement}</span>
          </div>
          <span class="meme-description">${this.escapeHtml(pattern.description)}</span>
        </div>
        <label class="toggle-switch-label">
          <input type="checkbox" class="meme-toggle" data-pattern="${this.escapeHtml(pattern.description)}" ${isEnabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      `;

      const toggle = item.querySelector('.meme-toggle') as HTMLInputElement;
      toggle?.addEventListener('change', async (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        const description = (e.target as HTMLInputElement).dataset.pattern;
        if (description) {
          await this.storageManager.setPatternEnabled(description, isChecked);
          this.showSaveStatus('Pattern updated');
        }
      });

      container.appendChild(item);
    });
  }

  private async loadCustomMemes(): Promise<void> {
    const container = document.getElementById('custom-meme-list');
    if (!container) return;

    const settings = await this.storageManager.getSettings();
    container.innerHTML = '';

    settings.customMemes.forEach((meme, index) => {
      const item = document.createElement('div');
      item.className = 'meme-item';

      item.innerHTML = `
        <div class="meme-item-content">
          <div class="meme-item-info">
            <span class="meme-pattern">${this.escapeHtml(meme.value)}</span>
            <span class="meme-replacement">${this.escapeHtml(meme.emoji)}</span>
          </div>
          <span class="meme-description">Custom meme</span>
        </div>
        <button class="btn btn-secondary" data-index="${index}">Remove</button>
      `;

      const removeBtn = item.querySelector('button');
      removeBtn?.addEventListener('click', async () => {
        const updated = settings.customMemes.filter((_, i) => i !== index);
        await this.storageManager.saveSetting('customMemes', updated);
        await this.loadCustomMemes();
        this.showSaveStatus('Custom meme removed');
      });

      container.appendChild(item);
    });
  }

  private async loadDomainRules(): Promise<void> {
    const settings = await this.storageManager.getSettings();
    const includeEl = document.getElementById('include-domains') as HTMLTextAreaElement | null;
    const excludeEl = document.getElementById('exclude-domains') as HTMLTextAreaElement | null;
    const blacklistSection = document.getElementById('blacklist-section') as HTMLElement;
    const whitelistSection = document.getElementById('whitelist-section') as HTMLElement;
    const modeRadios = document.querySelectorAll('input[name="domain-mode"]') as NodeListOf<HTMLInputElement>;

    if (includeEl) {
      includeEl.value = settings.includeDomains.join('\n');
    }
    if (excludeEl) {
      excludeEl.value = settings.excludeDomains.join('\n');
    }

    // Set mode (default to blacklist)
    const mode = (settings as any).domainMode || 'blacklist';
    modeRadios.forEach((radio) => {
      radio.checked = radio.value === mode;
    });

    // Show/hide sections based on mode
    if (mode === 'blacklist') {
      blacklistSection.style.display = 'block';
      whitelistSection.style.display = 'none';
    } else {
      blacklistSection.style.display = 'none';
      whitelistSection.style.display = 'block';
    }
  }

  private parseDomainList(input: string): string[] {
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private async updateStatistics(): Promise<void> {
    const stats = await this.storageManager.getStats();
    const settings = await this.storageManager.getSettings();

    const totalEl = document.getElementById('stat-total');
    const enabledEl = document.getElementById('stat-enabled');
    const enabledToggle = document.getElementById('extension-enabled') as HTMLInputElement;

    if (totalEl) {
      totalEl.textContent = stats.total.toString();
    }
    if (enabledEl) {
      enabledEl.textContent = settings.enabled ? 'Yes' : 'No';
    }
    if (enabledToggle) {
      enabledToggle.checked = settings.enabled;
    }
  }

  private applyTheme(isDark: boolean): void {
    const toggle = document.getElementById('theme-toggle') as HTMLInputElement;
    if (toggle) {
      toggle.checked = isDark;
    }
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  private showSaveStatus(message: string): void {
    const statusEl = document.getElementById('save-status');
    if (statusEl) {
      statusEl.textContent = `✓ ${message}`;
      statusEl.style.opacity = '1';
      setTimeout(() => {
        statusEl.style.opacity = '0';
      }, 2000);
    }
  }

  private exportSettings(): void {
    chrome.storage.sync.get(null, (items) => {
      const dataStr = JSON.stringify(items, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meme-extension-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      this.showSaveStatus('Settings exported');
    });
  }

  private importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const settings = JSON.parse(text);
        chrome.storage.sync.set(settings, () => {
          this.showSaveStatus('Settings imported');
          setTimeout(() => location.reload(), 1000);
        });
      } catch (error) {
        alert('Invalid settings file');
        console.error(error);
      }
    };
    input.click();
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
