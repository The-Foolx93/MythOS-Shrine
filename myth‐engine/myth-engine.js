/**
 * MYTHOS_SHRINE // SECTOR 03: THE EMPRESS
 * PROTOCOL: MYTH_ENGINE // LORE_GENERATOR
 * INTEGRITY: 13.5%
 */

const fs = require('fs');
const path = require('path');

const MEMORY_PATH = path.join(__dirname, '../shrinedaemon/memory_shard.json');

function generateLore() {
    console.log("-----------------------------------------");
    console.log("MYTH-ENGINE v1.0 // THE EMPRESS ACTIVE");
    console.log("-----------------------------------------");

    if (!fs.existsSync(MEMORY_PATH)) {
        console.log("> [ERROR]: Subconscious memory not found. Seed the Priestess first.");
        return;
    }

    const shard = JSON.parse(fs.readFileSync(MEMORY_PATH));
    const logs = shard.subconscious_logs;

    if (logs.length === 0) {
        console.log("> [EMPTY]: No seeds detected in the memory shard.");
        return;
    }

    // THE GROWTH LOGIC: Empress translates Resonance into Lore Seeds
    logs.forEach(entry => {
        const resonance = parseInt(entry.resonance);
        let seedType = resonance > 5000 ? "ANCIENT_RELIC" : "FRAGMENTED_ECHO";
        
        console.log(`> SEED BORN: [${entry.glyph}]`);
        console.log(`  TYPE: ${seedType} | STRENGTH: ${resonance}Hz`);
        console.log(`  LORE: This resonance patterns into a ${seedType === "ANCIENT_RELIC" ? "Physical Tool" : "Vibrational Ghost"}.`);
        console.log('---');
    });
}

generateLore();