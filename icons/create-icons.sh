#!/bin/bash
# Create placeholder icons using ImageMagick or native macOS tools

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to create icons..."
    convert -size 16x16 xc:transparent -fill "#3498db" -draw "circle 8,8 8,2" -font Helvetica-Bold -pointsize 10 -fill white -gravity center -annotate +0+0 "🎭" icon-16.png
    convert -size 48x48 xc:transparent -fill "#3498db" -draw "circle 24,24 24,6" -font Helvetica-Bold -pointsize 30 -fill white -gravity center -annotate +0+0 "🎭" icon-48.png
    convert -size 128x128 xc:transparent -fill "#3498db" -draw "circle 64,64 64,16" -font Helvetica-Bold -pointsize 80 -fill white -gravity center -annotate +0+0 "🎭" icon-128.png
# Use macOS sips if available
elif command -v sips &> /dev/null; then
    echo "Creating placeholder icons with macOS tools..."
    # Create a simple colored square as base
    cat > icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#3498db" rx="20"/>
  <text x="64" y="90" font-size="80" text-anchor="middle" fill="white">🎭</text>
</svg>
SVG
    # Note: sips cannot convert SVG, so we'll create a simple approach below
    echo "Please install ImageMagick or manually create icons"
    echo "Alternatively, use online tools like: https://www.favicon-generator.org/"
else
    echo "❌ ImageMagick not found. Creating placeholder instructions..."
    echo "Please create 16x16, 48x48, and 128x128 PNG icons manually"
    echo "Or use an online tool like: https://www.favicon-generator.org/"
fi
