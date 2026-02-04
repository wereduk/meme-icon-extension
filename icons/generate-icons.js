#!/usr/bin/env node

/**
 * Generate proper extension icons with visible design
 * Creates SVG icons with theater masks (happy/sad) design
 */

const fs = require('fs');
const path = require('path');

// Generate SVG icon content with visible blue background and theater masks
function generateSVG(size) {
  const radius = Math.round(size * 0.3);
  const centerX = size / 2;
  const centerY = size / 2;
  const eyeRadius = Math.round(size * 0.05);
  const eyeOffsetX = Math.round(size * 0.12);
  const eyeOffsetY = Math.round(size * 0.08);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with gradient -->
  <rect width="${size}" height="${size}" fill="url(#grad${size})" rx="${Math.round(size * 0.15)}"/>
  
  <!-- Highlight/shine effect -->
  <ellipse cx="${Math.round(size * 0.3)}" cy="${Math.round(size * 0.3)}" rx="${Math.round(size * 0.25)}" ry="${Math.round(size * 0.2)}" fill="white" opacity="0.15"/>
  
  <!-- Happy mask (left side) -->
  <circle cx="${centerX - radius}" cy="${centerY}" r="${radius}" fill="white"/>
  <!-- Eyes for happy mask -->
  <circle cx="${centerX - radius - eyeOffsetX}" cy="${centerY - eyeOffsetY}" r="${eyeRadius}" fill="#2980b9"/>
  <circle cx="${centerX - radius + eyeOffsetX}" cy="${centerY - eyeOffsetY}" r="${eyeRadius}" fill="#2980b9"/>
  <!-- Smile -->
  <path d="M ${centerX - radius - Math.round(size * 0.15)} ${centerY + Math.round(size * 0.08)} Q ${centerX - radius} ${centerY + Math.round(size * 0.15)} ${centerX - radius + Math.round(size * 0.15)} ${centerY + Math.round(size * 0.08)}" stroke="#2980b9" stroke-width="${Math.max(1, Math.round(size / 32))}" fill="none" stroke-linecap="round"/>
  
  <!-- Sad mask (right side) -->
  <circle cx="${centerX + radius}" cy="${centerY}" r="${radius}" fill="white"/>
  <!-- Eyes for sad mask -->
  <circle cx="${centerX + radius - eyeOffsetX}" cy="${centerY - eyeOffsetY}" r="${eyeRadius}" fill="#e74c3c"/>
  <circle cx="${centerX + radius + eyeOffsetX}" cy="${centerY - eyeOffsetY}" r="${eyeRadius}" fill="#e74c3c"/>
  <!-- Frown -->
  <path d="M ${centerX + radius - Math.round(size * 0.15)} ${centerY + Math.round(size * 0.08)} Q ${centerX + radius} ${centerY - Math.round(size * 0.08)} ${centerX + radius + Math.round(size * 0.15)} ${centerY + Math.round(size * 0.08)}" stroke="#e74c3c" stroke-width="${Math.max(1, Math.round(size / 32))}" fill="none" stroke-linecap="round"/>
</svg>`;
}

// Generate SVG files
function generateSVGs() {
  const sizes = [16, 48, 128];
  const iconDir = __dirname;

  console.log('🎭 Generating SVG icon files...\n');

  sizes.forEach(size => {
    const svg = generateSVG(size);
    const filename = `icon-${size}.svg`;
    const filepath = path.join(iconDir, filename);
    
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Created ${filename} (${size}×${size})`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📌 Next: Convert SVG files to PNG\n');
  console.log('Choose one of these methods:\n');
  
  console.log('🌐 Option 1: Online Tool (Easiest)');
  console.log('   Visit: https://cloudconvert.com/svg-to-png');
  console.log('   Upload icon-16.svg, icon-48.svg, icon-128.svg\n');
  
  console.log('🖥️  Option 2: Command Line');
  console.log('   Install ImageMagick: brew install imagemagick');
  console.log('   Then run:');
  console.log('     convert icon-16.svg icon-16.png');
  console.log('     convert icon-48.svg icon-48.png');
  console.log('     convert icon-128.svg icon-128.png\n');
  
  console.log('📦 Option 3: Node.js (with sharp)');
  console.log('   npm install sharp');
  console.log('   node convert-svg-to-png.js\n');
  
  console.log('✨ After conversion, run: make zip-all\n');
}

// Try to convert using Sharp if available
function trySharpConversion() {
  try {
    const sharp = require('sharp');
    const sizes = [16, 48, 128];
    const iconDir = __dirname;

    console.log('📦 Sharp library detected! Converting SVG → PNG...\n');

    let completed = 0;

    sizes.forEach(size => {
      const svgPath = path.join(iconDir, `icon-${size}.svg`);
      const pngPath = path.join(iconDir, `icon-${size}.png`);

      sharp(svgPath)
        .png({ density: 300 })
        .toFile(pngPath)
        .then(() => {
          console.log(`✅ Converted icon-${size}.svg → icon-${size}.png`);
          completed++;
          
          if (completed === sizes.length) {
            console.log('\n🎉 All PNG icons ready for packaging!');
          }
        })
        .catch(err => {
          console.error(`❌ Error converting icon-${size}:`, err.message);
        });
    });
  } catch (e) {
    // Sharp not available - SVG files are ready for manual conversion
  }
}

// Main execution
console.log('\n🎭 Meme Icon Extension - Icon Generator');
console.log('=' .repeat(60) + '\n');

generateSVGs();
trySharpConversion();
