#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./run-docker.sh [dev|prod]"
    echo "  dev  - Run in development mode"
    echo "  prod - Run in production mode"
    exit 1
fi

if [ "$1" = "dev" ]; then
    echo "Running in development mode..."
    export NODE_ENV=development
elif [ "$1" = "prod" ]; then
    echo "Running in production mode..."
    export NODE_ENV=production
else
    echo "Invalid mode: $1"
    echo "Usage: ./run-docker.sh [dev|prod]"
    exit 1
fi

echo "Stopping any running containers..."
docker compose down

echo "Building and starting containers in $NODE_ENV mode..."
docker compose up --build
