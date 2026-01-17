#!/usr/bin/env node

/**
 * LUXE Backend - Wrapper Entry Point
 * Handles both old and new directory structures
 * Delegates to index.js for server startup
 */

try {
  require('./index');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('❌ Failed to load server');
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    throw err;
  }
}
