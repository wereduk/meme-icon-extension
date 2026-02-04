# Icons

This directory contains the extension icons in multiple sizes required by browser stores.

## Files

- `icon-16.png` - 16x16 pixels (toolbar icon)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store, about page)

## Regenerating Icons

If you need to regenerate the icons, run:

```bash
node generate-icons.js
```

Or using Python (requires Pillow):

```bash
pip install Pillow
python3 generate-icons.py
```

## Custom Icons

The current icons are placeholders. For production:

1. Create custom icons in your preferred design tool
2. Export as PNG in 16x16, 48x48, and 128x128 sizes
3. Replace the files in this directory
4. Rebuild: `make zip-all`

### Design Guidelines

**Chrome Web Store:**
- Transparent or solid background
- Simple, recognizable design
- Works at small sizes (16x16)
- Use consistent visual style

**Firefox Add-ons:**
- Similar to Chrome
- Test on dark and light themes
- Avoid fine details at 16x16

**Recommended Tools:**
- Figma (web-based)
- Sketch (macOS)
- GIMP (free, cross-platform)
- Inkscape (vector graphics)
- Online: https://www.favicon-generator.org/

### Icon Design Tips

1. Keep it simple - icons need to work at 16x16
2. Use bold shapes and colors
3. Test on both light and dark backgrounds
4. Ensure recognizable when small
5. Follow platform-specific guidelines
