# Meme Icon Extension - Project Index

**Version:** 0.1.0 (Phase 1)  
**Last Updated:** 2026-01-28  
**Status:** Setup & Core Architecture

## Project Overview

Cross-browser extension that replaces meme/joke values with corresponding emojis.
- **Chrome:** Manifest V3
- **Firefox:** WebExtensions API
- **Safari:** App Extensions framework

### Core Requirements
- Replace text patterns (e.g., "69" → "♋︎") only in static text
- Exclude: dialogs, input fields, textareas, script/style tags
- Support dynamic DOM changes (MutationObserver)
- Maintain performance on large sites
- Support multiple regex patterns

---

## Architecture

```
src/
├── core/                      # Shared, framework-agnostic logic
│   ├── meme-map.json         # Meme values → emoji mappings
│   ├── dom-walker.ts         # TreeWalker implementation
│   ├── replacer.ts           # Text replacement engine
│   ├── filters.ts            # Node filtering (exclude dialog, input, etc)
│   └── types.ts              # TypeScript interfaces
│
├── content/                   # Content script (injected into pages)
│   ├── content.ts            # Main content script
│   ├── observer.ts           # MutationObserver handler
│   └── style.css             # Optional styling
│
├── background/               # Background worker
│   ├── background.ts         # Background service worker
│   └── storage.ts            # Configuration storage
│
├── popup/                     # UI (future)
│   ├── popup.html
│   ├── popup.ts
│   └── popup.css
│
└── browser/                   # Browser-specific wrappers
    ├── chrome.ts             # Chrome API wrapper
    ├── firefox.ts            # Firefox API wrapper
    └── safari.ts             # Safari API wrapper
```

---

## Key Components

### 1. Meme Map (meme-map.json)
```json
{
  "values": {
    "69": "♋︎",
    "420": "🌿",
    "666": "😈",
    "1337": "🤓"
  },
  "regex_patterns": [
    { "pattern": "\\b69\\b", "replacement": "♋︎", "enabled": true }
  ]
}
```

### 2. DOM Walker
- Uses TreeWalker API for efficient traversal
- Only processes text nodes
- Respects exclude list (script, style, dialog, input, textarea, select)

### 3. Replacer Engine
- Word boundary detection
- Caching for performance
- Safe HTML preservation

### 4. Content Script Flow
1. Load meme map from storage/defaults
2. Walk DOM and replace matching text nodes
3. Listen for MutationObserver changes
4. Debounce replacements for performance

---

## Build Process

### Development
```bash
make install      # npm install
make dev          # webpack watch
```

### Production
```bash
make build        # Build all core assets
make build-chrome # Create Chrome package
make build-firefox# Create Firefox package
make build-safari # Create Safari package
```

---

## Browser Manifests

### Chrome (Manifest V3)
- `permissions`: ["scripting", "activeTab"]
- `content_scripts`: Match all URLs except restricted domains
- `host_permissions`: Required for DOM access

### Firefox (Manifest V2 Extended)
- `permissions`: ["webRequest"]
- `content_scripts`: Same as Chrome but adapted

### Safari
- Xcode project integration
- Different permission model (more restricted)

---

## Testing Strategy

### Unit Tests
- `core/replacer.test.ts` - Replacement logic
- `core/dom-walker.test.ts` - DOM traversal
- `core/filters.test.ts` - Node filtering

### Integration Tests
- `content/content.test.ts` - Full content script flow
- Test against mock DOM structures

### Manual Testing
- Test on sites: GitHub, Twitter, Reddit, Medium
- Verify dialogs/inputs NOT affected
- Performance testing (100+ replacements)

---

## Known Challenges

| Challenge | Solution |
|-----------|----------|
| MutationObserver spam | Debouncing + batching |
| Dialog/Input detection | Exclude list + parent check |
| Unicode rendering | Test on multiple browsers |
| Safari permissions | More restricted API surface |
| Cache invalidation | Version-based + manual clear |

---

## Phase 1 Deliverables

- [x] Project scaffolding (package.json, tsconfig.json)
- [x] Webpack configuration
- [x] Makefile with build commands
- [x] Directory structure
- [ ] Manifest files (Chrome, Firefox, Safari)
- [ ] Core types & interfaces
- [ ] DOM walker implementation
- [ ] Replacer engine
- [ ] Meme map
- [ ] Content script boilerplate
- [ ] Background script boilerplate

---

## Environment Setup

- Node.js 18+
- npm 8+
- TypeScript 5.0+
- Webpack 5.x

---

## Important Notes

- **Exclude domains:** chrome://, about://, firefox://, data:// URLs
- **Performance:** Max 500ms per DOM walk on initial load
- **Storage:** Use browser's storage API (extension context)
- **Permissions:** Minimal required set only
- **Versioning:** Semantic versioning (MAJOR.MINOR.PATCH)

---

## Next Steps

1. Create manifest files for all browsers
2. Implement core types
3. Build DOM walker
4. Implement replacer engine
5. Create meme-map.json
6. Wire content script to core
7. Test on real sites
