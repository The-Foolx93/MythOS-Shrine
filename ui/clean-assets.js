#!/usr/bin/env node
const fs     = require('fs').promises;
const path   = require('path');
const crypto = require('crypto');

// ——— CONFIG ———
const ASSET_DIRS    = ['images', 'css', 'js'];  // scan these sub-folders
const HTML_FILES    = ['index.html'];           // change if you have more HTML entry points
const REFERENCE_EXT = ['.html','.css','.js'];   // file types to search for references
const DRY_RUN       = false;                    // set true to just report, false to delete

// ——— HELPERS ———
async function walk(dir, all=[]) {
  for (let name of await fs.readdir(dir)) {
    const full = path.join(dir, name);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) await walk(full, all);
    else all.push(full);
  }
  return all;
}

function hash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function extractReferences(str) {
  const refs = new Set();
  // match src="", href="", url(...)
  const regex = /(?:src|href)=["']([^"']+)["']|url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;
  let m;
  while ((m = regex.exec(str))) {
    const url = m[1] || m[2];
    if (!url.match(/^https?:\/\//)) refs.add(url.split('?')[0]);
  }
  return refs;
}

// ——— MAIN ———
(async function(){
  const projectRoot = path.resolve(__dirname);
  const allAssets   = [];
  const seenHashes  = new Map();
  const duplicates  = [];
  const orphaned    = [];
  const brokenRefs  = new Set();

  // 1) gather *all* files under each ASSET_DIRS
  for (let dir of ASSET_DIRS) {
    const folder = path.join(projectRoot, dir);
    const files  = await walk(folder);
    allAssets.push(...files);
  }

  // 2) dedupe by content‐hash
  for (let file of allAssets) {
    const buf  = await fs.readFile(file);
    const h    = hash(buf);
    if (seenHashes.has(h)) {
      duplicates.push(file);
    } else {
      seenHashes.set(h, file);
    }
  }

  // 3) scan your code files for references
  const codeFiles = (
    await Promise.all(
      REFERENCE_EXT.map(ext => walk(projectRoot)
        .then(files => files.filter(f => f.endsWith(ext)))
      )
    )
  ).flat();

  const referenced = new Set();
  for (let file of codeFiles) {
    const txt = await fs.readFile(file, 'utf8');
    extractReferences(txt).forEach(r => {
      // normalize relative paths
      const abs = path.resolve(path.dirname(file), r);
      referenced.add(abs);
    });
  }

  // 4) detect orphaned assets & broken references
  for (let asset of allAssets) {
    if (!referenced.has(asset)) orphaned.push(asset);
  }
  for (let ref of referenced) {
    if (!await fs.stat(ref).catch(()=>false)) brokenRefs.add(ref);
  }

  // 5) report & optionally delete
  console.log(`\nFound duplicates: ${duplicates.length}`);
  duplicates.forEach(f=>{
    console.log(' ↘ dup:', f);
    if (!DRY_RUN) fs.unlink(f);
  });

  console.log(`\nFound orphaned files: ${orphaned.length}`);
  orphaned.forEach(f=>{
    console.log(' ↘ orphan:', f);
    if (!DRY_RUN) fs.unlink(f);
  });

  console.log(`\nBroken references: ${brokenRefs.size}`);
  brokenRefs.forEach(r=>console.log(' ⚠ broken:', r));

  console.log('\n✅ clean-assets complete\n');
})();
