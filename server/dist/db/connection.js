"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
const envPath = path_1.default.resolve(process.cwd(), '.env');
dotenv_1.default.config({ path: envPath });
// Log connection details for debugging (remove in production)
console.log('Database connection details:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`Database: ${process.env.DB_NAME || 'bowling_scores'}`);
console.log(`User: ${process.env.DB_USER || 'postgres'}`);
// Create a new PostgreSQL connection pool
const pool = new pg_1.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bowling_scores',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    // Add connection timeout and retry logic
    connectionTimeoutMillis: 5000,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});
// Test the database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database successfully');
        client.release();
        return true;
    }
    catch (err) {
        console.error('Database connection error:', err);
        return false;
    }
};
// Attempt to connect with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        const connected = await testConnection();
        if (connected)
            return;
        console.log(`Connection attempt ${i + 1} failed. Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    console.error(`Failed to connect to database after ${retries} attempts`);
    process.exit(1);
};
// Connect to the database
connectWithRetry();
exports.default = pool;
