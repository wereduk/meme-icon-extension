/**
 * DOM tree walker for efficient text node traversal
 */

import { createNodeFilter } from './filters';
import { MemeReplacer } from './replacer';

export interface WalkerOptions {
  maxNodes?: number;
  debounceMs?: number;
}

export class DOMWalker {
  private replacer: MemeReplacer;
  private processedCount = 0;
  private options: WalkerOptions;

  constructor(replacer: MemeReplacer, options: WalkerOptions = {}) {
    this.replacer = replacer;
    this.options = { maxNodes: 5000, debounceMs: 300, ...options };
  }

  /**
   * Walk the DOM and replace meme values in text nodes
   */
  public walkAndReplace(root: Node = document.body): number {
    this.processedCount = 0;

    const filter = createNodeFilter();
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      filter
    );

    let currentNode = walker.nextNode();
    const nodesToProcess: Text[] = [];

    // Collect all nodes to process
    while (currentNode && nodesToProcess.length < (this.options.maxNodes || 5000)) {
      nodesToProcess.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    // Process collected nodes
    for (const textNode of nodesToProcess) {
      this.processTextNode(textNode);
    }

    return this.processedCount;
  }

  /**
   * Process a single text node
   */
  private processTextNode(textNode: Text): void {
    const originalText = textNode.textContent;
    if (!originalText || originalText.trim().length === 0) {
      return;
    }

    const result = this.replacer.replaceText(originalText);

    if (result.replaced !== result.original) {
      textNode.textContent = result.replaced;
      this.processedCount++;
    }
  }

  /**
   * Get the number of processed nodes
   */
  public getProcessedCount(): number {
    return this.processedCount;
  }
}
