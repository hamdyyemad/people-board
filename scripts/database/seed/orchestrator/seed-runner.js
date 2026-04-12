const fs = require('fs');
const path = require('path');
const errorHandler = require('../../migration/exception/error-handler');

/**
 * Database-Agnostic Seed Runner
 * Features:
 * - Executes seed files in order
 * - Tracks executed seeds to prevent re-seeding
 * - Works with any database adapter that implements the base interface
 * - Relies on 000_seeding_table.sql for schema setup
 */
class SeedRunner {
    constructor(adapter, seedDir) {
        this.adapter = adapter;
        this.seedDir = seedDir;
    }

    /**
     * Get all seed files sorted by name
     * Only includes files that start with numbers (e.g., 001_departments.sql)
     * Excludes 000_seeding_table.sql as it's a system file
     * This ensures execution order respects table dependencies
     */
    getSeedFiles() {
        if (!fs.existsSync(this.seedDir)) {
            errorHandler('Seed directory not found: ' + this.seedDir);
        }

        return fs
            .readdirSync(this.seedDir)
            .filter((file) => file.endsWith('.sql') && /^\d+_/.test(file) && file !== '000_seeding_table.sql')
            .sort();
    }

    /**
     * Ensure seeding tracking table exists
     * Relies on 000_seeding_table.sql file for schema setup
     */
    async ensureSeedingTable() {
        const tableExists = await this.adapter.tableExists('schema_seeds', 'public');

        if (!tableExists) {
            console.log('▶️  Creating seeding table...');

            const seedingTablePath = path.join(this.seedDir, '000_seeding_table.sql');

            if (!fs.existsSync(seedingTablePath)) {
                errorHandler(
                    'Seeding table does not exist and 000_seeding_table.sql file not found.\n' +
                    'Please create 000_seeding_table.sql in your seed directory.'
                );
            }

            const fileContent = fs.readFileSync(seedingTablePath, 'utf8');
            await this.adapter.executeRaw(fileContent);

            console.log('   ✅ Seeding table created successfully!\n');
        }
    }

    /**
     * Batch check which seeds have been executed
     * @param {string[]} seedNames
     * @returns {Promise<Set<string>>}
     */
    async getExecutedSeeds(seedNames) {
        if (seedNames.length === 0) {
            return new Set();
        }

        try {
            const results = await this.adapter.query(`
        SELECT seed_name 
        FROM public.schema_seeds 
        WHERE seed_name = ANY($1)
      `, [seedNames]);

            return new Set(results.map(r => r.seed_name));
        } catch (error) {
            if (error.message.includes('does not exist')) {
                await this.ensureSeedingTable();
                return new Set();
            }
            errorHandler(error);
        }
    }

    /**
     * Insert a seed record
     */
    async insertSeedRecord(seedName) {
        try {
            await this.adapter.executeRaw(
                `INSERT INTO public.schema_seeds (seed_name) VALUES ('${seedName}') 
                 ON CONFLICT (seed_name) DO NOTHING`
            );
        } catch (error) {
            errorHandler(`Failed to record seed execution for ${seedName}: ${error.message}`);
        }
    }

    /**
     * Execute a single seed file
     */
    async executeSeed(seedName, filePath) {
        console.log(`▶️  Seeding ${seedName}...`);

        const fileContent = fs.readFileSync(filePath, 'utf8');

        try {
            // Execute seed file in transaction
            await this.adapter.transaction(async (adapter) => {
                await adapter.executeRaw(fileContent);
            });

            // Record seed execution separately (after transaction commits)
            await this.insertSeedRecord(seedName);

            console.log(`   ✅ Seeded successfully!\n`);
        } catch (error) {
            console.error(`❌ Error executing ${seedName}:`);
            console.error(`   ${error.message}`);
            throw error;
        }
    }

    /**
     * Connect to the database and verify connection
     */
    async connectToDatabase() {
        console.log('🔌 Connecting to database...');
        await this.adapter.connect();

        const isConnected = await this.adapter.testConnection();
        if (!isConnected) {
            errorHandler('Failed to connect to database');
        }

        console.log('   ✅ Connected successfully!');
        console.log('');
    }

    /**
     * Check if a seed should be skipped
     * @param {string} file - Seed file name
     * @param {Set<string>} executedSet - Set of already executed seeds
     * @returns {boolean} - True if should skip
     */
    shouldSkipSeed(file, executedSet) {
        // Use pre-fetched results instead of querying each time
        if (executedSet.has(file)) {
            console.log(`⏭️  Skipping ${file} (already executed)`);
            return true;
        }

        return false;
    }

    /**
     * Process all seed files
     * @param {string[]} files - List of seed files
     * @param {Set<string>} executedSet - Set of already executed seeds
     * @returns {Promise<{executed: number, skipped: number}>}
     */
    async processSeedFiles(files, executedSet) {
        let executedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            const seedName = file;
            const filePath = path.join(this.seedDir, file);

            try {
                const shouldSkip = this.shouldSkipSeed(file, executedSet);
                if (shouldSkip) {
                    skippedCount++;
                    continue;
                }

                // Execute the seed
                await this.executeSeed(seedName, filePath);
                executedCount++;
            } catch (error) {
                throw error;
            }
        }

        return { executed: executedCount, skipped: skippedCount };
    }

    /**
     * Print seed summary
     * @param {number} executedCount - Number of executed seed files
     * @param {number} skippedCount - Number of skipped seed files
     */
    printSummary(executedCount, skippedCount) {
        console.log('');
        console.log('✅ Seed process completed!');
        console.log(`   Executed: ${executedCount}`);
        console.log(`   Skipped: ${skippedCount}`);
        console.log('');
    }

    /**
     * Run all pending seeds
     */
    async run() {
        console.log('🚀 Starting seed process...');

        // Step 1: Connect to database
        await this.connectToDatabase();

        // Step 2: Ensure seeding table exists
        await this.ensureSeedingTable();

        // Step 3: Get all seed files
        const files = this.getSeedFiles();

        if (files.length === 0) {
            console.log('✅ No seed files found');
            return { executed: 0, skipped: 0 };
        }

        console.log(`📝 Found ${files.length} seed file(s)`);

        // Step 4: Batch check all seeds at once
        console.log('🔍 Checking which seeds have been executed...');
        const executedSet = await this.getExecutedSeeds(files);
        console.log(`   Found ${executedSet.size} already executed seed(s)\n`);

        // Step 5: Process all seed files
        const { executed, skipped } = await this.processSeedFiles(files, executedSet);

        // Step 6: Print summary
        this.printSummary(executed, skipped);

        return { executed, skipped };
    }

    /**
     * Cleanup - close database connection
     */
    async cleanup() {
        await this.adapter.disconnect();
    }
}

module.exports = SeedRunner;
