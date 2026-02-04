#!/usr/bin/env node

/**
 * Build script for packaging Chrome extension
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distDir = path.join(__dirname, '../dist');
const manifestPath = path.join(__dirname, '../manifests/manifest-chrome-v3.json');
const outputZip = path.join(__dirname, '../chrome-extension.zip');

function buildChrome() {
  console.log('📦 Packaging Chrome extension...');

  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest-chrome-v3.json not found.');
    process.exit(1);
  }

  // Copy manifest to dist
  fs.copyFileSync(manifestPath, path.join(distDir, 'manifest.json'));

  // Create zip
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('❌ Archive error:', err);
    process.exit(1);
  });

  output.on('close', () => {
    console.log(`✅ Chrome extension packaged: ${outputZip} (${archive.pointer()} bytes)`);
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  archive.finalize();
}

buildChrome();
