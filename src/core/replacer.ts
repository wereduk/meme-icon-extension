/**
 * Core text replacement engine
 */

import { MemeMap, ReplacementResult } from './types';

export interface ReplacerOptions {
  useCache?: boolean;
  maxReplacements?: number;
}

export class MemeReplacer {
  private memeMap: MemeMap;
  private compiledRegexes: Map<string, RegExp> = new Map();
  private cache: Map<string, string> = new Map();
  private options: ReplacerOptions;

  constructor(memeMap: MemeMap, options: ReplacerOptions = {}) {
    this.memeMap = memeMap;
    this.options = { useCache: true, maxReplacements: 1000, ...options };
    this.compileRegexes();
  }

  /**
   * Compile all regex patterns for performance
   */
  private compileRegexes(): void {
    for (const pattern of this.memeMap.regexPatterns) {
      if (!pattern.enabled) continue;

      try {
        const regex = new RegExp(pattern.pattern, 'g');
        this.compiledRegexes.set(pattern.pattern, regex);
      } catch (error) {
        console.error(`Failed to compile regex: ${pattern.pattern}`, error);
      }
    }
  }

  /**
   * Replace text using simple string matching (word boundary aware)
   */
  public replaceText(text: string): ReplacementResult {
    const original = text;
    let replaced = text;
    let count = 0;

    // Check cache first
    if (this.options.useCache && this.cache.has(text)) {
      return {
        original,
        replaced: this.cache.get(text)!,
        count: 0, // Cache hit doesn't count as replacement
      };
    }

    // Apply each pattern
    for (const [pattern, regex] of this.compiledRegexes) {
      const matches = replaced.match(regex);
      if (matches) {
        const patternConfig = this.memeMap.regexPatterns.find(
          (p) => p.pattern === pattern
        );
        if (patternConfig) {
          replaced = replaced.replace(regex, patternConfig.replacement);
          count += matches.length;
        }
      }

      if (
        this.options.maxReplacements &&
        count >= this.options.maxReplacements
      ) {
        break;
      }
    }

    // Cache the result
    if (this.options.useCache && replaced !== original) {
      this.cache.set(original, replaced);
    }

    return { original, replaced, count };
  }

  /**
   * Update the meme map and recompile regexes
   */
  public updateMemeMap(memeMap: MemeMap): void {
    this.memeMap = memeMap;
    this.compiledRegexes.clear();
    this.cache.clear();
    this.compileRegexes();
  }

  /**
   * Clear the cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; enabled: boolean } {
    return {
      size: this.cache.size,
      enabled: this.options.useCache ?? false,
    };
  }
}
