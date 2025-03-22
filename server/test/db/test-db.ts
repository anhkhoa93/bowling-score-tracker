import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
let isInitialized = false;

export const initTestDb = async (): Promise<Database> => {
  try {
    // Always create a fresh database for tests
    if (db) {
      console.log('Closing existing database connection...');
      await db.close();
      db = null;
      isInitialized = false;
    }

    console.log('Initializing test database...');
    
    // Open an in-memory SQLite database
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });

    // Enable foreign keys in SQLite
    await db.exec('PRAGMA foreign_keys = ON;');

    // Create tables with SQLite-compatible schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        winner_id INTEGER,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (winner_id) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        frame_number INTEGER NOT NULL,
        roll_1 INTEGER NOT NULL DEFAULT 0,
        roll_2 INTEGER DEFAULT NULL,
        roll_3 INTEGER DEFAULT NULL,
        frame_score INTEGER DEFAULT NULL,
        total_score INTEGER DEFAULT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        UNIQUE (game_id, player_id, frame_number)
      );

      CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
      CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON game_scores(player_id);
    `);

    isInitialized = true;
    console.log('Test database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing test database:', error);
    throw error;
  }
};

export const closeTestDb = async (): Promise<void> => {
  if (db) {
    try {
      console.log('Closing test database connection...');
      await db.close();
      db = null;
      isInitialized = false;
      console.log('Test database connection closed');
    } catch (error) {
      console.error('Error closing test database:', error);
      throw error;
    }
  }
};

export const clearTestDb = async (): Promise<void> => {
  try {
    // Make sure the database is initialized
    if (!db || !isInitialized) {
      await initTestDb();
    }

    console.log('Clearing test database...');
    
    // Delete all data from tables in reverse order to avoid foreign key constraints
    await db!.exec(`
      DELETE FROM game_scores;
      DELETE FROM games;
      DELETE FROM players;
    `);
    
    console.log('Test database cleared');
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
};

// Helper function to convert PostgreSQL-style parameters ($1, $2) to SQLite-style parameters (?, ?)
const convertPgParamsToSqlite = (text: string): string => {
  return text.replace(/\$\d+/g, '?');
};

// Helper function to handle PostgreSQL-specific syntax
const handlePostgresSpecificSyntax = (text: string): string => {
  // Convert NOW() to CURRENT_TIMESTAMP
  let modifiedText = text.replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP');
  
  // Convert RETURNING * to empty string (SQLite doesn't support RETURNING)
  modifiedText = modifiedText.replace(/RETURNING \*/g, '');
  
  return modifiedText;
};

// Mock query function that uses the test database
export const query = async (text: string, params: any[] = []): Promise<any> => {
  try {
    // Make sure the database is initialized
    if (!db || !isInitialized) {
      await initTestDb();
    }
    
    // Convert PostgreSQL-style query to SQLite-compatible query
    let sqliteText = convertPgParamsToSqlite(text);
    sqliteText = handlePostgresSpecificSyntax(sqliteText);
    
    // Handle INSERT queries that need to return data
    const isInsert = text.trim().toUpperCase().startsWith('INSERT');
    const needsReturning = text.includes('RETURNING *');
    
    // For SQLite, we'll need to do two separate queries to mimic PostgreSQL's RETURNING
    if (isInsert && needsReturning) {
      // Execute the insert statement
      try {
        await db!.run(sqliteText, ...params);
      } catch (error: any) {
        console.error('Error executing insert statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
      
      // Get the last inserted ID
      const tableName = text.match(/INTO\s+([^\s(]+)/i)?.[1];
      if (!tableName) {
        throw new Error('Could not determine table name from query');
      }
      
      const lastId = await db!.get('SELECT last_insert_rowid() as id');
      
      // Get the inserted row
      const row = await db!.get(`SELECT * FROM ${tableName} WHERE id = ?`, lastId.id);
      
      return {
        rows: row ? [row] : []
      };
    }
    
    // Handle queries by type
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      try {
        const rows = await db!.all(sqliteText, ...params);
        return { rows };
      } catch (error: any) {
        console.error('Error executing SELECT statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
    } else if (text.trim().toUpperCase().startsWith('INSERT')) {
      try {
        const result = await db!.run(sqliteText, ...params);
        return { 
          rows: [], 
          rowCount: result.changes,
          lastID: result.lastID
        };
      } catch (error: any) {
        console.error('Error executing INSERT statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
    } else if (text.trim().toUpperCase().startsWith('UPDATE')) {
      try {
        const result = await db!.run(sqliteText, ...params);
        return { 
          rows: [], 
          rowCount: result.changes 
        };
      } catch (error: any) {
        console.error('Error executing UPDATE statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
    } else if (text.trim().toUpperCase().startsWith('DELETE')) {
      try {
        const result = await db!.run(sqliteText, ...params);
        return { 
          rows: [], 
          rowCount: result.changes 
        };
      } catch (error: any) {
        console.error('Error executing DELETE statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
    } else {
      try {
        const result = await db!.run(sqliteText, ...params);
        return { 
          rows: [], 
          rowCount: result.changes 
        };
      } catch (error: any) {
        console.error('Error executing statement:', error);
        console.error('Statement:', sqliteText);
        console.error('Params:', params);
        throw error;
      }
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Export default for compatibility with connection.ts
export default {
  query,
  end: closeTestDb,
  on: () => {}
};

// Initialize the database before exporting
initTestDb().catch(err => {
  console.error('Failed to initialize test database:', err);
});
