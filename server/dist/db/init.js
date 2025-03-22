"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const connection_1 = __importDefault(require("./connection"));
/**
 * Initialize the database by running the schema.sql file
 */
async function initializeDatabase() {
    try {
        // Read the schema SQL file - handle both development and production paths
        let schemaPath = path_1.default.join(__dirname, 'schema.sql');
        // If file doesn't exist at the dist path, try the src path (for development)
        if (!fs_1.default.existsSync(schemaPath)) {
            // Go up one directory (from dist/db to dist) then to src/db
            schemaPath = path_1.default.join(__dirname, '..', '..', 'src', 'db', 'schema.sql');
            console.log(`Looking for schema at alternate path: ${schemaPath}`);
        }
        if (!fs_1.default.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at either dist or src paths. Checked: ${schemaPath}`);
        }
        const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
        console.log(`Successfully read schema file from: ${schemaPath}`);
        // Execute the SQL commands
        await connection_1.default.query(schemaSql);
        console.log('Database schema initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database schema:', error);
        process.exit(1);
    }
}
// If this file is run directly, initialize the database
if (require.main === module) {
    initializeDatabase()
        .then(() => {
        console.log('Database initialization complete');
        process.exit(0);
    })
        .catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });
}
exports.default = initializeDatabase;
