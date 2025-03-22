import dotenv from 'dotenv';
import './jest.d.ts';

// Load environment variables
dotenv.config();

// Mock the database connection
jest.mock('../src/db/connection', () => {
  return {
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
});
