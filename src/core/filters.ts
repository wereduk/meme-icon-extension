/**
 * Filter for determining which nodes should NOT be processed
 */

const EXCLUDED_TAG_NAMES = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'META',
  'LINK',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'OPTION',
  'BUTTON',
  'FORM',
]);

const EXCLUDED_ARIA_ROLES = new Set([
  'dialog',
  'alertdialog',
  'textbox',
  'combobox',
  'listbox',
]);

const EXCLUDED_INPUT_TYPES = new Set([
  'text',
  'password',
  'email',
  'number',
  'search',
  'tel',
  'url',
  'hidden',
]);

/**
 * Check if a node is a dialog or modal element
 */
export function isDialogElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  const elem = node as HTMLElement;

  // Check for dialog element
  if (elem.tagName === 'DIALOG') return true;

  // Check ARIA role
  const role = elem.getAttribute('role');
  if (role && EXCLUDED_ARIA_ROLES.has(role.toLowerCase())) return true;

  // Check data-* attributes that indicate modals
  if (elem.getAttribute('data-modal') || elem.getAttribute('data-dialog')) {
    return true;
  }

  // Check common modal classes
  const className = (elem.className || '').toLowerCase();
  if (className.includes('modal') || className.includes('dialog')) {
    return true;
  }

  return false;
}

/**
 * Check if a node should be excluded from processing
 */
export function shouldExcludeNode(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const elem = node as HTMLElement;

    // Exclude by tag name
    if (EXCLUDED_TAG_NAMES.has(elem.tagName)) return true;

    // Exclude if inside dialog/modal
    if (isDialogElement(elem)) return true;

    // Exclude if parent is dialog/modal
    let parent = elem.parentElement;
    while (parent) {
      if (isDialogElement(parent)) return true;
      parent = parent.parentElement;
    }

    // Exclude input elements
    if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
      return true;
    }

    // Exclude contenteditable elements
    if (elem.getAttribute('contenteditable') === 'true') return true;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent) return false;

    // Check parent tag
    if (EXCLUDED_TAG_NAMES.has(parent.tagName)) return true;

    // Check if parent is dialog
    if (isDialogElement(parent)) return true;

    // Check if inside dialog
    let ancestor = parent.parentElement;
    while (ancestor) {
      if (isDialogElement(ancestor)) return true;
      ancestor = ancestor.parentElement;
    }

    // Check if contenteditable
    if (parent.getAttribute('contenteditable') === 'true') return true;
  }

  return false;
}

/**
 * Create a TreeWalker filter function
 */
export function createNodeFilter(): NodeFilter {
  return {
    acceptNode(node: Node): number {
      if (shouldExcludeNode(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        return NodeFilter.FILTER_ACCEPT;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        return NodeFilter.FILTER_SKIP;
      }

      return NodeFilter.FILTER_REJECT;
    },
  };
}
