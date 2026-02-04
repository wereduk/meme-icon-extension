/**
 * Unit tests for DOM node filtering
 */

import {
  shouldExcludeNode,
  isDialogElement,
  createNodeFilter,
} from '@core/filters';

describe('Node Filtering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('shouldExcludeNode', () => {
    test('excludes script tags', () => {
      const script = document.createElement('script');
      script.type = 'text/plain'; // Prevent execution
      const textNode = document.createTextNode('code');
      script.appendChild(textNode);
      container.appendChild(script);

      expect(shouldExcludeNode(textNode)).toBe(true);
    });

    test('excludes style tags', () => {
      const style = document.createElement('style');
      const textNode = document.createTextNode('css');
      style.appendChild(textNode);
      container.appendChild(style);

      expect(shouldExcludeNode(textNode)).toBe(true);
    });

    test('excludes textarea elements', () => {
      const textarea = document.createElement('textarea');
      textarea.textContent = 'user input';
      container.appendChild(textarea);

      expect(shouldExcludeNode(textarea)).toBe(true);
    });

    test('excludes input elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      expect(shouldExcludeNode(input)).toBe(true);
    });

    test('excludes dialog elements', () => {
      const dialog = document.createElement('dialog');
      const text = document.createTextNode('dialog content');
      dialog.appendChild(text);
      container.appendChild(dialog);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes elements with role="dialog"', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'dialog');
      const text = document.createTextNode('modal');
      div.appendChild(text);
      container.appendChild(div);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes elements with data-modal attribute', () => {
      const div = document.createElement('div');
      div.setAttribute('data-modal', 'true');
      const text = document.createTextNode('modal');
      div.appendChild(text);
      container.appendChild(div);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes elements with modal class', () => {
      const div = document.createElement('div');
      div.className = 'modal-overlay';
      const text = document.createTextNode('modal');
      div.appendChild(text);
      container.appendChild(div);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes contenteditable elements', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      const text = document.createTextNode('editable');
      div.appendChild(text);
      container.appendChild(div);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('includes regular paragraph text', () => {
      const p = document.createElement('p');
      const text = document.createTextNode('regular text');
      p.appendChild(text);
      container.appendChild(p);

      expect(shouldExcludeNode(text)).toBe(false);
    });

    test('includes div text nodes', () => {
      const div = document.createElement('div');
      const text = document.createTextNode('content');
      div.appendChild(text);
      container.appendChild(div);

      expect(shouldExcludeNode(text)).toBe(false);
    });
  });

  describe('isDialogElement', () => {
    test('detects dialog tag', () => {
      const dialog = document.createElement('dialog');
      expect(isDialogElement(dialog)).toBe(true);
    });

    test('detects ARIA dialog role', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'dialog');
      expect(isDialogElement(div)).toBe(true);
    });

    test('detects ARIA alertdialog role', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'alertdialog');
      expect(isDialogElement(div)).toBe(true);
    });

    test('detects data-modal attribute', () => {
      const div = document.createElement('div');
      div.setAttribute('data-modal', 'true');
      expect(isDialogElement(div)).toBe(true);
    });

    test('detects data-dialog attribute', () => {
      const div = document.createElement('div');
      div.setAttribute('data-dialog', 'true');
      expect(isDialogElement(div)).toBe(true);
    });

    test('detects modal CSS class', () => {
      const div = document.createElement('div');
      div.className = 'modal';
      expect(isDialogElement(div)).toBe(true);
    });

    test('detects dialog CSS class', () => {
      const div = document.createElement('div');
      div.className = 'dialog-wrapper';
      expect(isDialogElement(div)).toBe(true);
    });

    test('returns false for non-dialog elements', () => {
      const p = document.createElement('p');
      expect(isDialogElement(p)).toBe(false);
    });

    test('returns false for text nodes', () => {
      const text = document.createTextNode('content');
      expect(isDialogElement(text)).toBe(false);
    });
  });

  describe('createNodeFilter', () => {
    test('returns a NodeFilter object', () => {
      const filter = createNodeFilter();
      expect(filter).toBeDefined();
      expect(typeof (filter as any).acceptNode).toBe('function');
    });

    test('accepts text nodes', () => {
      const filter = createNodeFilter();
      const textNode = document.createTextNode('hello');
      const result = (filter as any).acceptNode(textNode);
      expect(result).toBe(NodeFilter.FILTER_ACCEPT);
    });

    test('rejects excluded text nodes', () => {
      const filter = createNodeFilter();
      const script = document.createElement('script');
      const textNode = document.createTextNode('code');
      script.appendChild(textNode);

      const result = (filter as any).acceptNode(textNode);
      expect(result).toBe(NodeFilter.FILTER_REJECT);
    });

    test('skips element nodes', () => {
      const filter = createNodeFilter();
      const div = document.createElement('div');
      const result = (filter as any).acceptNode(div);
      expect(result).toBe(NodeFilter.FILTER_SKIP);
    });

    test('rejects other node types', () => {
      const filter = createNodeFilter();
      const comment = document.createComment('comment');
      const result = (filter as any).acceptNode(comment);
      expect(result).toBe(NodeFilter.FILTER_REJECT);
    });
  });

  describe('Parent chain checking', () => {
    test('excludes text in parent dialog', () => {
      const dialog = document.createElement('dialog');
      const div = document.createElement('div');
      const text = document.createTextNode('inside dialog');
      div.appendChild(text);
      dialog.appendChild(div);
      container.appendChild(dialog);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes text deeply nested in dialog', () => {
      const dialog = document.createElement('dialog');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const text = document.createTextNode('nested');
      
      div3.appendChild(text);
      div2.appendChild(div3);
      div1.appendChild(div2);
      dialog.appendChild(div1);
      container.appendChild(dialog);

      expect(shouldExcludeNode(text)).toBe(true);
    });

    test('excludes text in modal with class', () => {
      const modal = document.createElement('div');
      modal.className = 'modal-content';
      const innerDiv = document.createElement('div');
      const text = document.createTextNode('modal text');
      
      innerDiv.appendChild(text);
      modal.appendChild(innerDiv);
      container.appendChild(modal);

      expect(shouldExcludeNode(text)).toBe(true);
    });
  });
});
