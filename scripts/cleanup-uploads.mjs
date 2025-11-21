#!/usr/bin/env node
/**
 * Upload Cleanup Script
 * Deletes old upload files based on RETENTION_DAYS environment variable
 * 
 * Usage:
 *   node scripts/cleanup-uploads.mjs
 * 
 * Environment:
 *   RETENTION_DAYS - Number of days to keep files (default: 7)
 *   UPLOADS_DIR - Directory containing uploads (default: server/uploads)
 *   DRY_RUN - If 'true', only log what would be deleted
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const RETENTION_DAYS = Number(process.env.RETENTION_DAYS) || 7;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(ROOT_DIR, 'server', 'uploads');
const DRY_RUN = process.env.DRY_RUN === 'true';

const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

console.log('[cleanup] Configuration:');
console.log(`  RETENTION_DAYS: ${RETENTION_DAYS}`);
console.log(`  UPLOADS_DIR: ${UPLOADS_DIR}`);
console.log(`  DRY_RUN: ${DRY_RUN}`);

if (!fs.existsSync(UPLOADS_DIR)) {
  console.log('[cleanup] Uploads directory does not exist, nothing to clean');
  process.exit(0);
}

function cleanupDirectory(dir) {
  const files = fs.readdirSync(dir);
  let deletedCount = 0;
  let skippedCount = 0;
  let totalSize = 0;

  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively clean subdirectories
      const subResult = cleanupDirectory(filePath);
      deletedCount += subResult.deleted;
      skippedCount += subResult.skipped;
      totalSize += subResult.size;
      continue;
    }

    // Check file age
    const ageMs = now - stats.mtimeMs;
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    if (ageMs > RETENTION_MS) {
      if (DRY_RUN) {
        console.log(`[cleanup] Would delete: ${filePath} (${ageDays.toFixed(1)} days old, ${(stats.size / 1024).toFixed(2)} KB)`);
      } else {
        try {
          fs.unlinkSync(filePath);
          console.log(`[cleanup] Deleted: ${filePath} (${ageDays.toFixed(1)} days old)`);
        } catch (error) {
          console.error(`[cleanup] Failed to delete ${filePath}:`, error.message);
        }
      }
      deletedCount++;
      totalSize += stats.size;
    } else {
      skippedCount++;
    }
  }

  return { deleted: deletedCount, skipped: skippedCount, size: totalSize };
}

console.log('[cleanup] Starting cleanup...');
const result = cleanupDirectory(UPLOADS_DIR);

console.log('[cleanup] Summary:');
console.log(`  Files deleted: ${result.deleted}`);
console.log(`  Files kept: ${result.skipped}`);
console.log(`  Space freed: ${(result.size / 1024 / 1024).toFixed(2)} MB`);

if (DRY_RUN) {
  console.log('[cleanup] DRY RUN - No files were actually deleted');
}

console.log('[cleanup] Cleanup complete');
process.exit(0);
