#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 10

# Initialize the database
echo "Initializing database schema..."
node dist/db/init.js

# Start the server
echo "Starting Fastify server..."
exec node dist/index.js
