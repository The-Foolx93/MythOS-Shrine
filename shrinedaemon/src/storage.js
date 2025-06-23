// shrinedaemon/src/storage.js
const fs   = require('fs').promises;
const path = require('path');

const DATA_DIR  = process.env.DATA_DIR  || 'Shrine';
const DATA_FILE = process.env.DATA_FILE || 'Pulses.md';
const storePath = path.resolve(DATA_DIR, DATA_FILE);

/**
 * appendPulse(text): writes “- [ISO] text” and returns that line.
 */
async function appendPulse(text) {
  const line = `- [${new Date().toISOString()}] ${text}\n`;
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.appendFile(storePath, line, 'utf8');
  return line.trim();
}

/**
 * readAllPulses(): returns array of non-empty lines from the file.
 */
async function readAllPulses() {
  try {
    const data = await fs.readFile(storePath, 'utf8');
    return data.split('\n').filter(l => l.trim());
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

module.exports = { appendPulse, readAllPulses };
