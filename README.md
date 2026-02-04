# 🎭 Meme Icon Extension

Replace meme values with emojis across the web: `69` → `♋︎`, `420` → `🌿`, `666` → `😈`, `1337` → `🤓`

Works on **Chrome**, **Firefox**, and **Safari** with smart DOM filtering to avoid dialogs and input fields.

## 🚀 Quick Start

```bash
# Install dependencies
make install

# Development mode (watch + rebuild on changes)
make dev

# Build for production
make build

# Build for specific browser
make build-chrome    # Creates chrome-extension.zip
make build-firefox   # Creates firefox-extension.xpi
```

## 📁 Project Structure

```
src/
├── core/              # Shared, framework-agnostic logic
│   ├── types.ts       # TypeScript interfaces
│   ├── meme-map.json  # Meme values database
│   ├── replacer.ts    # Text replacement engine
│   ├── dom-walker.ts  # DOM traversal logic
│   └── filters.ts     # Node filtering (exclude dialogs, inputs, etc)
│
├── content/           # Content script (injected into pages)
│   └── content.ts     # Main script entry point
│
└── background/        # Background service worker
    └── background.ts  # Configuration + message routing
```

## 🎯 Key Features

✅ **Smart Filtering** - Only replaces text in static content, excludes:
  - Dialog & modal windows
  - Input fields & textareas
  - Script & style tags
  - Form elements

✅ **Dynamic Content** - Uses `MutationObserver` to catch content added via JavaScript

✅ **Performance** - Debounced processing (300ms), caching, TreeWalker API

✅ **Multi-Browser** - Single codebase, multiple manifest versions

✅ **Extensible** - Easy to add new meme values in `src/core/meme-map.json`

## 📝 Meme Map

Edit `src/core/meme-map.json` to add or modify replacements:

```json
{
  "values": {
    "69": "♋︎",
    "420": "🌿",
    "666": "😈",
    "1337": "🤓"
  },
  "regexPatterns": [
    {
      "pattern": "\\b69\\b",
      "replacement": "♋︎",
      "enabled": true
    }
  ]
}
```

## 🔨 Build Commands

### Development
```bash
make dev           # Watch mode - recompile on file changes
make type-check    # Type check without emit
make lint          # Lint code
```

### Production
```bash
make build         # Build core assets
make build-chrome  # Package for Chrome Web Store
make build-firefox # Package for Firefox Add-ons
make build-safari  # Guidance for Safari (requires Xcode)
```

### Testing
```bash
make test          # Run unit tests (Phase 2)
make test-watch    # Watch mode tests (Phase 2)
```

### Maintenance
```bash
make clean         # Remove build artifacts
make index         # Update INDEX.md
```

## 🏗️ Architecture

### Core Engine
- **filters.ts** - Determines which DOM nodes to process
- **replacer.ts** - Compiles regex patterns, performs text replacement with caching
- **dom-walker.ts** - TreeWalker API integration for efficient traversal

### Content Script
- Runs on page load, walks entire DOM
- Sets up MutationObserver for dynamic content
- Listens for messages from background worker

### Background Worker
- Manages extension configuration (storage)
- Routes messages between tabs
- Handles extension icon clicks

## 🌐 Browser Support

| Browser | Status | Manifest |
|---------|--------|----------|
| Chrome  | ✅ Ready | Manifest V3 |
| Firefox | ✅ Ready | WebExtensions |
| Safari  | 📅 Phase 2 | Requires Xcode |

## ⚙️ Technical Stack

- **TypeScript** - Type-safe development
- **Webpack** - Module bundler
- **Jest** - Testing framework (Phase 2)
- **Chrome Extensions API** - Runtime API

## 🔍 How It Works

1. **Initial Load**: Content script walks entire DOM on page load
2. **Replacement**: Text nodes are checked against regex patterns
3. **Mutation Handling**: MutationObserver catches dynamically added content
4. **Debouncing**: Rapid DOM changes are batched to prevent performance issues
5. **Caching**: Processed text is cached to avoid re-processing

## ⚠️ Known Limitations

- Safari requires manual Xcode integration
- Dialog detection uses tag names, ARIA roles, CSS classes, and data attributes
- Performance scales with DOM size (typically < 500ms on initial load)
- Regex patterns must be valid JavaScript RegExp strings

## 📋 Development Roadmap

- **Phase 1** ✅ - Core setup, DOM walker, replacer engine
- **Phase 2** 📅 - Unit tests, popup UI, performance benchmarks
- **Phase 3** 📅 - Real-world testing, browser compatibility, distribution

## 📖 Documentation

- [INDEX.md](INDEX.md) - AI context file with complete architecture
- [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md) - Phase 1 deliverables
- [Makefile](Makefile) - All available commands

## 🔧 Configuration

### Storage
Uses `chrome.storage.local` for persistent configuration across browser sessions.

### Permissions (Chrome V3)
- `scripting` - Execute content scripts
- `activeTab` - Access current tab
- `host_permissions` - Access to all URLs (except system pages)

## 🐛 Troubleshooting

### Build errors
```bash
# Clear build cache
make clean
make build
```

### TypeScript errors
```bash
# Type check
make type-check

# Rebuild type definitions
npm install
```

### Tests failing
```bash
# Run tests with verbose output
npm run test -- --verbose
```

## 📜 License

MIT

## 👨‍💻 Development

Written as a senior developer project. See [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md) for detailed technical decisions.
