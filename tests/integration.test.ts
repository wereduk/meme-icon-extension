/**
 * Integration tests - Full replacement flow with simulated DOM
 */

import { MemeReplacer } from '@core/replacer';
import { DOMWalker } from '@core/dom-walker';
import { MemeMap } from '@core/types';

describe('Integration: Full Replacement Flow', () => {
  let container: HTMLElement;
  const memeMap: MemeMap = {
    values: {
      '69': '♋︎',
      '420': '🌿',
      '666': '😈',
      '1337': '🤓',
    },
    regexPatterns: [
      { pattern: '\\b69\\b', replacement: '♋︎', enabled: true },
      { pattern: '\\b420\\b', replacement: '🌿', enabled: true },
      { pattern: '\\b666\\b', replacement: '😈', enabled: true },
      { pattern: '\\b1337\\b', replacement: '🤓', enabled: true },
    ],
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Real-world scenarios', () => {
    test('replaces memes in blog post structure', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      // Simulate blog post HTML
      const article = document.createElement('article');
      const header = document.createElement('header');
      const title = document.createElement('h1');
      title.textContent = 'The Year 69 Was Funny';
      const content = document.createElement('p');
      content.textContent = 'On 420 people laughed at 1337 jokes.';

      header.appendChild(title);
      article.appendChild(header);
      article.appendChild(content);
      container.appendChild(article);

      walker.walkAndReplace(container);

      expect(title.textContent).toContain('♋︎');
      expect(content.textContent).toContain('🌿');
      expect(content.textContent).toContain('🤓');
    });

    test('preserves HTML structure in complex markup', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      // Simulate nested HTML with formatting
      const div = document.createElement('div');
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const em = document.createElement('em');
      const link = document.createElement('a');

      strong.textContent = '69';
      em.textContent = ' is funny, 420 ';
      link.textContent = 'read more';
      link.href = '#';

      p.appendChild(strong);
      p.appendChild(document.createTextNode(' memes and '));
      p.appendChild(em);
      p.appendChild(link);
      div.appendChild(p);
      container.appendChild(div);

      walker.walkAndReplace(container);

      expect(strong.textContent).toContain('♋︎');
      expect(em.textContent).toContain('🌿');
      expect(link.href).toContain('#'); // Link href should be unchanged
    });

    test('ignores memes in form inputs', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = '69';
      const textarea = document.createElement('textarea');
      textarea.value = '420 users logged in';
      const label = document.createElement('label');
      label.textContent = 'Error 1337';

      form.appendChild(input);
      form.appendChild(textarea);
      form.appendChild(label);
      container.appendChild(form);

      walker.walkAndReplace(container);

      expect(input.value).toBe('69'); // Should NOT change
      expect(textarea.value).toBe('420 users logged in'); // Should NOT change
      expect(label.textContent).toContain('🤓'); // Label text SHOULD change
    });

    test('ignores memes in dialogs and modals', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      // Dialog with meme numbers
      const dialog = document.createElement('dialog');
      const dialogText = document.createElement('p');
      dialogText.textContent = 'You have 69 messages';
      dialog.appendChild(dialogText);

      // Modal div with meme numbers
      const modal = document.createElement('div');
      modal.className = 'modal-content';
      const modalText = document.createElement('p');
      modalText.textContent = 'Error code 420';
      modal.appendChild(modalText);

      // Regular content with meme numbers
      const content = document.createElement('p');
      content.textContent = 'But this 69 should change';

      container.appendChild(dialog);
      container.appendChild(modal);
      container.appendChild(content);

      walker.walkAndReplace(container);

      expect(dialogText.textContent).toBe('You have 69 messages'); // Should NOT change
      expect(modalText.textContent).toBe('Error code 420'); // Should NOT change
      expect(content.textContent).toContain('♋︎'); // Should change
    });

    test('handles mixed content (text + memes)', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const article = document.createElement('article');
      const p1 = document.createElement('p');
      p1.textContent = 'This post got 69 upvotes and 420 comments.';
      const p2 = document.createElement('p');
      p2.innerHTML =
        'Error <code>666</code> occurred. <strong>1337</strong> hackers know this.';
      const p3 = document.createElement('p');
      p3.textContent = 'Regular text without memes here.';

      article.appendChild(p1);
      article.appendChild(p2);
      article.appendChild(p3);
      container.appendChild(article);

      walker.walkAndReplace(container);

      expect(p1.textContent).toContain('♋︎');
      expect(p1.textContent).toContain('🌿');
      expect(p2.textContent).toContain('😈');
      expect(p2.textContent).toContain('🤓');
      expect(p3.textContent).toBe('Regular text without memes here.');
    });

    test('handles multiple replacements in single text node', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = '69, 420, 666, 1337 - all memes in one sentence!';
      container.appendChild(p);

      walker.walkAndReplace(container);

      expect(p.textContent).toContain('♋︎');
      expect(p.textContent).toContain('🌿');
      expect(p.textContent).toContain('😈');
      expect(p.textContent).toContain('🤓');
    });
  });

  describe('Edge cases', () => {
    test('handles empty DOM', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const processed = walker.walkAndReplace(container);
      expect(processed).toBe(0);
    });

    test('handles very large DOM', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      // Create many elements
      for (let i = 0; i < 100; i++) {
        const p = document.createElement('p');
        p.textContent = `Item ${i} with 69 memes`;
        container.appendChild(p);
      }

      expect(() => walker.walkAndReplace(container)).not.toThrow();
    });

    test('handles special characters in text', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = 'Special chars: 69! @420# $666% ^1337&';
      container.appendChild(p);

      walker.walkAndReplace(container);

      expect(p.textContent).toContain('♋︎');
      expect(p.textContent).toContain('🌿');
      expect(p.textContent).toContain('😈');
      expect(p.textContent).toContain('🤓');
    });

    test('handles unicode in text', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = '你好 69 こんにちは 420 مرحبا';
      container.appendChild(p);

      walker.walkAndReplace(container);

      expect(p.textContent).toContain('♋︎');
      expect(p.textContent).toContain('🌿');
    });

    test('handles whitespace variations', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p = document.createElement('p');
      p.textContent = '69\n420\t666  1337';
      container.appendChild(p);

      walker.walkAndReplace(container);

      expect(p.textContent).toContain('♋︎');
      expect(p.textContent).toContain('🌿');
      expect(p.textContent).toContain('😈');
      expect(p.textContent).toContain('🤓');
    });
  });

  describe('Performance', () => {
    test('completes within reasonable time on medium DOM', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      // Create medium-sized DOM
      for (let i = 0; i < 50; i++) {
        const section = document.createElement('section');
        for (let j = 0; j < 5; j++) {
          const p = document.createElement('p');
          p.textContent = `Section ${i}, paragraph ${j} with 69 and 420 in it.`;
          section.appendChild(p);
        }
        container.appendChild(section);
      }

      const start = performance.now();
      walker.walkAndReplace(container);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });
  });

  describe('State management', () => {
    test('updating meme map affects future replacements', () => {
      const replacer = new MemeReplacer(memeMap);
      const walker = new DOMWalker(replacer);

      const p1 = document.createElement('p');
      p1.textContent = '69 memes';
      container.appendChild(p1);

      walker.walkAndReplace(container);
      expect(p1.textContent).toContain('♋︎');

      // Update meme map
      const newMap: MemeMap = {
        values: { '69': '🔥' },
        regexPatterns: [{ pattern: '\\b69\\b', replacement: '🔥', enabled: true }],
      };

      replacer.updateMemeMap(newMap);
      const p2 = document.createElement('p');
      p2.textContent = '69 new memes';
      container.appendChild(p2);

      walker.walkAndReplace(container);
      expect(p2.textContent).toContain('🔥');
    });
  });
});
