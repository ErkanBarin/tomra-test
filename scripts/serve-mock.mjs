#!/usr/bin/env node

/**
 * Minimal Node ESM static server for mock app files
 * Serves tests/fixtures/mock-app on http://127.0.0.1:5173
 * No external dependencies required
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MOCK_APP_DIR = join(__dirname, '..', 'tests', 'fixtures', 'mock-app');
const PORT = 5173;
const HOST = '127.0.0.1';

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'text/plain';
}

/**
 * Serve static files from mock app directory
 */
async function serveFile(req, res) {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    
    const fullPath = join(MOCK_APP_DIR, filePath);
    const content = await readFile(fullPath);
    const mimeType = getMimeType(filePath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(content);
    
    console.log(`✓ ${req.method} ${req.url} → ${mimeType}`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      console.log(`✗ ${req.method} ${req.url} → 404 Not Found`);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      console.error(`✗ ${req.method} ${req.url} → 500 Error:`, error.message);
    }
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function handleOptions(req, res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end();
}

/**
 * Main request handler
 */
function requestHandler(req, res) {
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
  } else {
    serveFile(req, res);
  }
}

/**
 * Start the server
 */
const server = createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Mock app server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${MOCK_APP_DIR}`);
  console.log(`\n📋 Available pages:`);
  console.log(`   • http://${HOST}:${PORT}/upload.html`);
  console.log(`   • http://${HOST}:${PORT}/training.html`);
  console.log(`   • http://${HOST}:${PORT}/registry.html`);
  console.log(`\n🛑 Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  server.close(() => {
    console.log('✓ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✓ Server stopped');
    process.exit(0);
  });
});