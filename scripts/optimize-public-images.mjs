#!/usr/bin/env node
/**
 * Resize and compress public images for faster page loads.
 * Run: node scripts/optimize-public-images.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const HERO_MAX = 1920;
const GALLERY_MAX = 1600;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 82;

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function sizeOf(filePath) {
  return fs.statSync(filePath).size;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function optimizeWebp(filename, maxWidth) {
  const filePath = path.join(publicDir, filename);
  if (!fs.existsSync(filePath)) return;

  const before = sizeOf(filePath);
  const tmp = `${filePath}.opt`;
  run('cwebp', ['-quiet', '-q', String(WEBP_QUALITY), '-resize', String(maxWidth), '0', filePath, '-o', tmp]);
  fs.renameSync(tmp, filePath);
  const after = sizeOf(filePath);
  console.log(`  ${filename}: ${formatKb(before)} → ${formatKb(after)}`);
}

function optimizeHero() {
  const jpegPath = path.join(publicDir, 'homepage.jpeg');
  if (!fs.existsSync(jpegPath)) return;

  const before = sizeOf(jpegPath);
  run('sips', ['-Z', String(HERO_MAX), jpegPath, '--out', jpegPath]);
  run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPEG_QUALITY), jpegPath, '--out', jpegPath]);

  const webpPath = path.join(publicDir, 'homepage.webp');
  run('cwebp', ['-quiet', '-q', String(WEBP_QUALITY), jpegPath, '-o', webpPath]);

  const afterJpeg = sizeOf(jpegPath);
  const afterWebp = sizeOf(webpPath);
  console.log(`  homepage.jpeg: ${formatKb(before)} → ${formatKb(afterJpeg)}`);
  console.log(`  homepage.webp: ${formatKb(afterWebp)} (new)`);
}

console.log('Optimizing public images...\n');
optimizeHero();

const gallery = ['2.webp', '3.webp', '6.webp', '7.webp', '8.webp', '9.webp', '10.webp', '11.webp', '12.webp', '13.webp'];
console.log('\nGallery slides:');
for (const file of gallery) {
  optimizeWebp(file, GALLERY_MAX);
}

console.log('\nDone.');
