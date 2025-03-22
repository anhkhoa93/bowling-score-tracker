/**
 * Script to copy schema.sql to the dist directory
 */
const fs = require('fs');
const path = require('path');

// Create dist/db directory if it doesn't exist
const distDbDir = path.join(__dirname, 'dist', 'db');
if (!fs.existsSync(distDbDir)) {
  console.log(`Creating directory: ${distDbDir}`);
  fs.mkdirSync(distDbDir, { recursive: true });
}

// Copy schema.sql to dist/db
const srcSchemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
const distSchemaPath = path.join(distDbDir, 'schema.sql');

try {
  if (fs.existsSync(srcSchemaPath)) {
    fs.copyFileSync(srcSchemaPath, distSchemaPath);
    console.log(`Successfully copied schema.sql to: ${distSchemaPath}`);
  } else {
    console.error(`Source schema file not found at: ${srcSchemaPath}`);
    process.exit(1);
  }
} catch (error) {
  console.error('Error copying schema file:', error);
  process.exit(1);
}
