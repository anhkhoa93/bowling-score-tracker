@echo off
setlocal

if "%1"=="" (
    echo Usage: run-docker.bat [dev^|prod]
    echo   dev  - Run in development mode
    echo   prod - Run in production mode
    exit /b 1
)

if "%1"=="dev" (
    echo Running in development mode...
    set NODE_ENV=development
) else if "%1"=="prod" (
    echo Running in production mode...
    set NODE_ENV=production
) else (
    echo Invalid mode: %1
    echo Usage: run-docker.bat [dev^|prod]
    exit /b 1
)

echo Stopping any running containers...
docker compose down

echo Building and starting containers in %NODE_ENV% mode...
docker compose up --build

endlocal
