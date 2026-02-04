export interface MemeMap {
  values: Record<string, string>;
  regexPatterns: RegexPattern[];
}

export interface RegexPattern {
  pattern: string;
  replacement: string;
  enabled: boolean;
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
  debounceMs: number;
  maxReplacementsPerRun: number;
}
