import '@jest/globals';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import { initTestDb, closeTestDb, clearTestDb } from './test/db/test-db';

// Load environment variables
dotenv.config();

// Mock the database connection to use the test database
jest.mock('./src/db/connection', () => {
  // Import the test database module
  const testDb = require('./test/db/test-db');
  
  // Return the mock implementation
  return {
    __esModule: true,
    ...testDb.default,
    default: testDb.default,
    query: testDb.query
  };
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
      toBe(value: any): R;
      toEqual(value: any): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(value: any): R;
      toHaveProperty(key: string, value?: any): R;
      toBeGreaterThan(value: number): R;
      toBeLessThan(value: number): R;
      toThrow(error?: any): R;
    }
  }
}

// Initialize the test database before running tests
beforeAll(async () => {
  try {
    console.log('Setting up test environment...');
    await initTestDb();
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Clear the database before each test
beforeEach(async () => {
  try {
    await clearTestDb();
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
});

// Add a global afterAll hook to ensure the database is closed after all tests
afterAll(async () => {
  try {
    console.log('Tearing down test environment...');
    await closeTestDb();
    console.log('Test environment teardown complete');
  } catch (error) {
    console.error('Error tearing down test environment:', error);
    throw error;
  }
});
