export interface MemeMap {
  values: Record<string, string>;
  regexPatterns: RegexPattern[];
}

export interface RegexPattern {
  pattern: string;
  replacement: string;
  enabled: boolean;
  description?: string;
}

export interface ReplacementResult {
  original: string;
  replaced: string;
  count: number;
}

export type BrowserType = 'chrome' | 'firefox' | 'safari';

export interface ContentScriptConfig {
  enabled: boolean;
  memeMap: MemeMap;
  excludeDomains: string[];
  includeDomains: string[];
  debounceMs: number;
  maxReplacementsPerRun: number;
}

export interface MemeSettings {
  enabled: boolean;
  darkMode: boolean;
  patterns: Record<string, boolean>;
  customMemes: CustomMeme[];
  includeDomains: string[];
  excludeDomains: string[];
  domainMode?: 'blacklist' | 'whitelist';
}

export interface CustomMeme {
  value: string;
  emoji: string;
}

export interface Stats {
  total: number;
  perPattern: Record<string, number>;}