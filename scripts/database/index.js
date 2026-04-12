#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const { spawn } = require('child_process');
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Display the main menu
 */
function displayMenu() {
    console.clear();
    console.log('╔════════════════════════════════════════╗');
    console.log('║     Database Management System          ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('  [1] Run Migrations');
    console.log('  [2] Run Seeds');
    console.log('  [3] Exit');
    console.log('');
}

/**
 * Run migrations
 */
async function runMigrations() {
    console.log('\n🚀 Starting migration process...\n');
    
    return new Promise((resolve) => {
        const migrationProcess = spawn('node', [
            path.join(__dirname, 'migration/run-migrations.js'),
            'supabase'
        ], {
            stdio: 'inherit',
        });

        migrationProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Migrations completed successfully!');
            } else {
                console.error('\n❌ Migrations failed with code:', code);
            }
            resolve();
        });

        migrationProcess.on('error', (error) => {
            console.error('❌ Error running migrations:', error);
            resolve();
        });
    });
}

/**
 * Run seeds
 */
async function runSeeds() {
    console.log('\n🌱 Starting seed process...\n');
    
    return new Promise((resolve) => {
        const seedProcess = spawn('node', [
            path.join(__dirname, 'seed/run-seed.js'),
            'supabase'
        ], {
            stdio: 'inherit',
        });

        seedProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Seeds completed successfully!');
            } else {
                console.error('\n❌ Seeds failed with code:', code);
            }
            resolve();
        });

        seedProcess.on('error', (error) => {
            console.error('❌ Error running seeds:', error);
            resolve();
        });
    });
}

/**
 * Main menu loop
 */
async function mainLoop() {
    displayMenu();

    rl.question('Please select an option [1-3]: ', async (answer) => {
        const choice = answer.trim();

        switch (choice) {
            case '1':
                await runMigrations();
                rl.question('\nPress Enter to continue...', () => {
                    mainLoop();
                });
                break;

            case '2':
                await runSeeds();
                rl.question('\nPress Enter to continue...', () => {
                    mainLoop();
                });
                break;

            case '3':
                console.log('\n👋 Goodbye!\n');
                rl.close();
                process.exit(0);
                break;

            default:
                console.log('\n❌ Invalid option. Please select 1, 2, or 3.');
                rl.question('\nPress Enter to continue...', () => {
                    mainLoop();
                });
        }
    });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!\n');
    rl.close();
    process.exit(0);
});

// Start the application
mainLoop();
