const AdapterFactory = require('../../migration/engine/factory/adapter-factory');
const SeedRunner = require('../orchestrator/seed-runner');

/**
 * Executes the complete seed process: creates the adapter,
 * initializes the runner, runs seeds, and performs cleanup.
 *
 * @param {string} folderName - The database type/folder name (e.g., 'supabase').
 * @param {string} connectionString - The database connection string.
 * @param {string} seedDir - The directory containing seed files.
 * @returns {Promise<any>} The result of the seed run.
 */
async function executeSeedWorkflow(folderName, connectionString, seedDir) {
    // 1. Create database adapter based on DB type
    const adapter = AdapterFactory.create(folderName, connectionString);

    // 2. Create seed runner
    const runner = new SeedRunner(adapter, seedDir);
    console.log(`Starting seeds for DB type: ${folderName}`);

    // 3. Run seeds
    const result = await runner.run();
    console.log(`Seeds finished. Result: ${JSON.stringify(result)}`);

    // 4. Cleanup/Disconnect
    await runner.cleanup();

    return result;
}

module.exports = executeSeedWorkflow;
