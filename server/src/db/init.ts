import fs from 'fs';
import path from 'path';
import pool from './connection';

/**
 * Initialize the database by running the schema.sql file
 */
async function initializeDatabase() {
  try {
    // Read the schema SQL file - handle both development and production paths
    let schemaPath = path.join(__dirname, 'schema.sql');
    
    // If file doesn't exist at the dist path, try the src path (for development)
    if (!fs.existsSync(schemaPath)) {
      // Go up one directory (from dist/db to dist) then to src/db
      schemaPath = path.join(__dirname, '..', '..', 'src', 'db', 'schema.sql');
      console.log(`Looking for schema at alternate path: ${schemaPath}`);
    }
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at either dist or src paths. Checked: ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`Successfully read schema file from: ${schemaPath}`);

    // Execute the SQL commands
    await pool.query(schemaSql);
    console.log('Database schema initialized successfully');
  } catch (error) {
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

export default initializeDatabase;
