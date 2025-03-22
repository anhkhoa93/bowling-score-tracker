/**
 * Database initialization script
 * Run this script to create the database schema
 */
const { exec } = require('child_process');
const path = require('path');

console.log('Building TypeScript files...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  console.log(`Build output: ${stdout}`);
  
  console.log('Initializing database...');
  const initScript = path.join(__dirname, 'dist', 'db', 'init.js');
  
  exec(`node ${initScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Database initialization error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Database initialization stderr: ${stderr}`);
    }
    console.log(`Database initialization output: ${stdout}`);
    console.log('Database initialization complete!');
  });
});
