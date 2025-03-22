FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install dotenv pg @types/pg

# Copy source code
COPY . .

# Set environment variable (defaults to 'development')
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Build TypeScript code
RUN npm run build

# Make the entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose the API port
EXPOSE 3001

# Use the entrypoint script to initialize the database and start the server in production
# or use ts-node-dev for development
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then ./docker-entrypoint.sh; else npm run dev; fi"]
