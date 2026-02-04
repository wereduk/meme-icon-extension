#!/usr/bin/env node

/**
 * Build script for packaging Safari extension
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const manifestPath = path.join(__dirname, '../manifests/manifest-safari.json');

function buildSafari() {
  console.log('📦 Packaging Safari extension...');
  console.log('⚠️  Safari packaging requires Xcode and is platform-specific.');
  console.log('📄 Manifest file:', manifestPath);
  console.log('📁 Build output:', distDir);
  console.log('');
  console.log('Next steps:');
  console.log('1. Open Xcode and create a new "Safari App Extension" project');
  console.log('2. Copy files from dist/ to the extension target');
  console.log('3. Update manifest.json with Safari-specific keys');
  console.log('4. Build and test in Xcode');
}

buildSafari();
