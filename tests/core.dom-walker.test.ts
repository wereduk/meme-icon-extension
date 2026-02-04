/**
 * Unit tests for DOM walker
 */

import { DOMWalker } from '@core/dom-walker';
import { MemeReplacer } from '@core/replacer';
import { MemeMap } from '@core/types';

describe('DOMWalker', () => {
  let container: HTMLElement;
  const memeMap: MemeMap = {
    values: { '69': '♋︎', '420': '🌿' },
    regexPatterns: [
      { pattern: '\\b69\\b', replacement: '♋︎', enabled: true },
      { pattern: '\\b420\\b', replacement: '🌿', enabled: true },
    ],
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('walkAndReplace', () => {
    test('processes simple text nodes', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = 'This is 69';
      container.appendChild(p);

      const processed = walker.walkAndReplace(container);

      expect(processed).toBeGreaterThan(0);
      expect(p.textContent).toContain('♋︎');
    });

    test('processes multiple text nodes', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p1 = document.createElement('p');
      p1.textContent = 'First 69';
      const p2 = document.createElement('p');
      p2.textContent = 'Second 420';
      
      container.appendChild(p1);
      container.appendChild(p2);

      const processed = walker.walkAndReplace(container);

      expect(processed).toBeGreaterThan(0);
      expect(p1.textContent).toContain('♋︎');
      expect(p2.textContent).toContain('🌿');
    });

    test('skips script tags', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const script = document.createElement('script');
      script.textContent = 'var x = 69;';
      container.appendChild(script);

      const processed = walker.walkAndReplace(container);

      expect(script.textContent).toBe('var x = 69;');
    });

    test('skips excluded elements', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const input = document.createElement('input');
      input.value = '69';
      input.type = 'text';
      container.appendChild(input);

      walker.walkAndReplace(container);

      expect(input.value).toBe('69');
    });

    test('respects maxNodes option', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer, { maxNodes: 1 });

      // Create many nodes
      for (let i = 0; i < 5; i++) {
        const p = document.createElement('p');
        p.textContent = `Text ${i} has 69`;
        container.appendChild(p);
      }

      const processed = walker.walkAndReplace(container);

      // Should process at most 1 node
      expect(processed).toBeLessThanOrEqual(1);
    });

    test('handles nested elements', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const div = document.createElement('div');
      const p = document.createElement('p');
      const span = document.createElement('span');
      
      span.textContent = 'Nested 69 here';
      p.appendChild(span);
      div.appendChild(p);
      container.appendChild(div);

      walker.walkAndReplace(container);

      expect(span.textContent).toContain('♋︎');
    });

    test('skips empty text nodes', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.appendChild(document.createTextNode(''));
      p.appendChild(document.createTextNode('   '));
      p.appendChild(document.createTextNode('69'));
      container.appendChild(p);

      const processed = walker.walkAndReplace(container);

      expect(processed).toBeGreaterThan(0);
    });
  });

  describe('getProcessedCount', () => {
    test('returns processed node count', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p1 = document.createElement('p');
      p1.textContent = '69';
      const p2 = document.createElement('p');
      p2.textContent = '420';
      
      container.appendChild(p1);
      container.appendChild(p2);

      walker.walkAndReplace(container);

      expect(walker.getProcessedCount()).toBe(2);
    });

    test('returns zero when nothing processed', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = 'no memes here';
      container.appendChild(p);

      walker.walkAndReplace(container);

      expect(walker.getProcessedCount()).toBe(0);
    });
  });

  describe('TreeWalker integration', () => {
    test('uses document.createTreeWalker', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = '69';
      container.appendChild(p);

      // Should not throw
      expect(() => walker.walkAndReplace(container)).not.toThrow();
    });

    test('preserves HTML structure', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const div = document.createElement('div');
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      
      strong.textContent = '69';
      p.appendChild(strong);
      div.appendChild(p);
      container.appendChild(div);

      walker.walkAndReplace(container);

      expect(container.querySelector('strong')).toBeTruthy();
      expect(container.querySelector('strong')?.textContent).toContain('♋︎');
    });
  });

  describe('Dialog exclusion', () => {
    test('skips text in dialog elements', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const dialog = document.createElement('dialog');
      const p = document.createElement('p');
      p.textContent = '69 in dialog';
      dialog.appendChild(p);
      container.appendChild(dialog);

      walker.walkAndReplace(container);

      expect(p.textContent).toBe('69 in dialog');
    });

    test('skips text in modal divs', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const modal = document.createElement('div');
      modal.className = 'modal';
      const p = document.createElement('p');
      p.textContent = '69';
      modal.appendChild(p);
      container.appendChild(modal);

      walker.walkAndReplace(container);

      expect(p.textContent).toBe('69');
    });
  });
});
