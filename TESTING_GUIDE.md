# 🧪 Testing Guide - Load Extension Locally

## Chrome / Chromium / Brave

### 1. Build Extension
```bash
make build
```

### 2. Prepare Manifest
```bash
# Copy Chrome manifest to dist/
cp manifests/manifest-chrome-v3.json dist/manifest.json
```

### 3. Load in Browser
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `dist/` folder from this project
6. Extension icon should appear in toolbar

### 4. Test on a Website
1. Visit any website (e.g., https://example.com)
2. Add text with meme values:
   - Type "69" somewhere → should show ♋︎
   - Type "420" → should show 🌿
   - Type "666" → should show 😈
3. Click extension icon to open popup
4. Try toggle enable/disable
5. Try "Reset" button

### 5. Debug Console
- Right-click extension icon → "Inspect popup" (for popup console)
- F12 on any page → Check content script logs
- `chrome://extensions/` → Click "background page" (for background logs)

---

## Firefox

### 1. Build Extension
```bash
make build
```

### 2. Prepare Manifest
```bash
# Copy Firefox manifest to dist/
cp manifests/manifest-firefox.json dist/manifest.json
```

### 3. Load Temporarily
1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to `dist/` folder
5. Select `manifest.json`
6. Extension loads temporarily (until browser restart)

### 4. Test Same as Chrome
- Visit websites with meme values
- Check console logs
- Test popup functionality

---

## Quick Test Script

Create a test HTML file to verify replacements:

```bash
cat > test-page.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <title>Meme Extension Test Page</title>
</head>
<body>
  <h1>Test Meme Replacements</h1>
  
  <h2>Should Replace:</h2>
  <p>This number 69 should become an emoji.</p>
  <p>The number 420 is also a meme.</p>
  <p>Error code 666 occurred.</p>
  <p>1337 hackers know this.</p>
  
  <h2>Should NOT Replace:</h2>
  <p>The year 1969 contains 69 but as part of larger number.</p>
  <input type="text" value="69" placeholder="Input with 69">
  <textarea>420 in textarea should not change</textarea>
  
  <dialog open>
    <p>Dialog with 69 should NOT be replaced</p>
  </dialog>
  
  <div class="modal">
    <p>Modal with 420 should NOT be replaced</p>
  </div>
  
  <h2>Complex HTML:</h2>
  <article>
    <p>Post with <strong>69</strong> upvotes and <em>420</em> comments.</p>
    <p>Code: <code>666</code> - Technical: 1337</p>
  </article>
</body>
</html>
HTML
```

Then open `test-page.html` in browser with extension loaded.

---

## Troubleshooting

### Extension doesn't load
- Check console for errors: `chrome://extensions/` → "Errors" button
- Verify manifest.json is in dist/
- Make sure all files (content.js, background.js, popup.html) are in dist/

### Replacements don't work
- Open DevTools (F12) → Console tab
- Look for "Meme Icon Extension: initializing"
- Check for errors in console
- Try clicking extension icon → "Reset" button

### Popup doesn't open
- Check if popup.html exists in dist/
- Right-click icon → "Inspect popup" to see errors
- Verify manifest.json has "action" field

### Content script not injecting
- Check if site is excluded (chrome://, about://, etc)
- Look in DevTools → Sources → Content Scripts
- Refresh the page after loading extension

---

## Console Commands for Testing

Open DevTools console on any page and try:

```javascript
// Check if extension loaded
console.log('Extension active');

// Manually test replacement
const testText = document.createElement('p');
testText.textContent = 'Test 69 and 420 here';
document.body.appendChild(testText);

// After a moment, text should be replaced
```

---

## Performance Testing

Test on large DOMs:

```javascript
// Create many elements
for (let i = 0; i < 100; i++) {
  const p = document.createElement('p');
  p.textContent = `Item ${i} with 69 and 420`;
  document.body.appendChild(p);
}

// Check console for processing time
// Should complete in < 500ms
```

---

## Real Website Testing

### Recommended Sites:
- ✅ **GitHub** - Test on issue comments
- ✅ **Reddit** - Test on post content  
- ✅ **Medium** - Test on articles
- ✅ **Twitter/X** - Test on tweets
- ✅ **MDN** - Test on documentation

### What to Check:
- ✅ Text replaces correctly
- ✅ Input fields NOT affected
- ✅ Dialogs NOT affected
- ✅ Page performance not impacted
- ✅ No console errors

---

## Updating After Changes

When you modify code:

1. **Rebuild:**
   ```bash
   make build
   ```

2. **Reload extension:**
   - Chrome: Go to `chrome://extensions/` → Click reload icon
   - Firefox: Go to `about:debugging` → Click "Reload"

3. **Refresh test page:**
   - Press Ctrl+R (or Cmd+R on Mac)
   - Extension will re-inject

---

## Next Steps

Once local testing works:
1. Test on multiple websites
2. Verify browser compatibility
3. Check performance on slow connections
4. Test with different screen sizes (popup responsive)
5. Package for production: `make build-chrome`
