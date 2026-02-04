#!/usr/bin/env node

/**
 * Build script for packaging Firefox extension
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distDir = path.join(__dirname, '../dist');
const manifestPath = path.join(__dirname, '../manifests/manifest-firefox.json');
const outputZip = path.join(__dirname, '../firefox-extension.xpi');

function buildFirefox() {
  console.log('📦 Packaging Firefox extension...');

  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest-firefox.json not found.');
    process.exit(1);
  }

  // Copy manifest to dist
  fs.copyFileSync(manifestPath, path.join(distDir, 'manifest.json'));

  // Create XPI (which is a zip file)
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('❌ Archive error:', err);
    process.exit(1);
  });

  output.on('close', () => {
    console.log(`✅ Firefox extension packaged: ${outputZip} (${archive.pointer()} bytes)`);
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  archive.finalize();
}

buildFirefox();
