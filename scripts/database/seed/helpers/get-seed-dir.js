const path = require("path");
const fs = require("fs");

/**
 * Get the seed directory based on command line arguments or use default
 * Priority: process.argv[2] (CLI argument) or default to 'supabase'
 * 
 * Usage:
 *   node run-seed.js supabase
 *   node run-seed.js         # defaults to 'supabase'
 */
function getSeedDir() {
    // Get from command line arguments (process.argv[2]) or default to 'supabase'
    const folderName = process.argv[2] || "supabase";

    // Resolve to the seed directory
    // __dirname is scripts/database/seed/helpers, so go up 4 levels to project root
    const seedDir = path.resolve(__dirname, `../../../../database/${folderName}/seed`);

    // Check if the directory exists
    if (!fs.existsSync(seedDir)) {
        throw new Error(`Seed directory not found: ${seedDir}`);
    }

    return { seedDir, folderName };
}

module.exports = getSeedDir;
