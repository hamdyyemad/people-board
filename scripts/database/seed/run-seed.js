const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../../../.env"),
});

const getSeedDir = require("./helpers/get-seed-dir");
const loadConfig = require("../migration/config");
const executeSeedWorkflow = require("./engine");

async function main() {
    console.log('🗄️  Running Database Seed Tool');

    // 1. Checking for the Dir name if exist and then return its path
    // NOTE: Priority for process.argv not the function argument passing
    const { seedDir, folderName } = getSeedDir();
    console.log(`📁  Step 1 - Seed Folder: "${folderName}", with Path: "${seedDir}"`);

    // 2. FACTORY PATTERN: Create config based on folder name
    const { connectionString, maskedConnectionString } = loadConfig(folderName);
    console.log(`🔗  Step 2 - Connection String: "${maskedConnectionString}"`);

    // 3. Execute seed workflow
    const result = await executeSeedWorkflow(folderName, connectionString, seedDir);
    console.log(`📤  Step 3 - Seed result: ${JSON.stringify(result)}`);

    // Exit with success
    console.log('👍 All done!');
    process.exit(0);
}

// Run the main function
// Using .catch() here ensures any unhandled errors are caught
main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
