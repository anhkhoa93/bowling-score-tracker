#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 5

# Run the database initialization script
echo "Initializing database..."
node dist/db/init.js

echo "Database initialization complete!"
