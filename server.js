#!/usr/bin/env node
// Wrapper to handle both old and new directory structures
try {
  require('./src/server.js');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    // Fallback if src/server.js doesn't exist
    console.log('src/server.js not found, checking root...');
    require('./server.js');
  } else {
    throw err;
  }
}
