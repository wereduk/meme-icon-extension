/**
 * Unit test for replacer engine - demonstrates the core functionality
 */

import { MemeReplacer } from '@core/replacer';
import { MemeMap } from '@core/types';

describe('MemeReplacer', () => {
  const memeMap: MemeMap = {
    values: {
      '69': '♋︎',
      '420': '🌿',
      '666': '😈',
    },
    regexPatterns: [
      { pattern: '\\b69\\b', replacement: '♋︎', enabled: true },
      { pattern: '\\b420\\b', replacement: '🌿', enabled: true },
      { pattern: '\\b666\\b', replacement: '😈', enabled: true },
    ],
  };

  test('replaces single meme value', () => {
    const replacer = new MemeReplacer(memeMap);
    const result = replacer.replaceText('This is 69 nice');
    expect(result.replaced).toBe('This is ♋︎ nice');
    expect(result.count).toBe(1);
  });

  test('respects word boundaries', () => {
    const replacer = new MemeReplacer(memeMap);
    const result = replacer.replaceText('The number 369 is not replaced');
    expect(result.replaced).toBe('The number 369 is not replaced');
    expect(result.count).toBe(0);
  });

  test('replaces multiple occurrences', () => {
    const replacer = new MemeReplacer(memeMap);
    const result = replacer.replaceText('69 and 420 and 666');
    expect(result.replaced).toBe('♋︎ and 🌿 and 😈');
    expect(result.count).toBe(3);
  });

  test('uses cache', () => {
    const replacer = new MemeReplacer(memeMap, { useCache: true });
    const text = 'Nice 69 meme';
    
    // First call
    const result1 = replacer.replaceText(text);
    expect(result1.replaced).toBe('Nice ♋︎ meme');
    
    // Second call should hit cache
    const result2 = replacer.replaceText(text);
    expect(result2.replaced).toBe('Nice ♋︎ meme');
  });

  test('disables disabled patterns', () => {
    const customMap: MemeMap = {
      values: memeMap.values,
      regexPatterns: [
        { pattern: '\\b69\\b', replacement: '♋︎', enabled: false },
        { pattern: '\\b420\\b', replacement: '🌿', enabled: true },
      ],
    };
    
    const replacer = new MemeReplacer(customMap);
    const result = replacer.replaceText('69 and 420');
    expect(result.replaced).toBe('69 and 🌿');
  });

  test('updates meme map', () => {
    const replacer = new MemeReplacer(memeMap);
    let result = replacer.replaceText('69');
    expect(result.replaced).toBe('♋︎');
    
    const newMap: MemeMap = {
      values: { '69': '🔥' },
      regexPatterns: [{ pattern: '\\b69\\b', replacement: '🔥', enabled: true }],
    };
    
    replacer.updateMemeMap(newMap);
    result = replacer.replaceText('69');
    expect(result.replaced).toBe('🔥');
  });

  test('clears cache', () => {
    const replacer = new MemeReplacer(memeMap, { useCache: true });
    replacer.replaceText('69');
    
    const stats1 = replacer.getCacheStats();
    expect(stats1.size).toBeGreaterThan(0);
    
    replacer.clearCache();
    const stats2 = replacer.getCacheStats();
    expect(stats2.size).toBe(0);
  });
});
