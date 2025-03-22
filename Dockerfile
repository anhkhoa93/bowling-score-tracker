FROM node:18-alpine 
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./

RUN npm install
RUN npm install -D @swc/cli @swc/core @swc/jest
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Set environment variable (defaults to 'development')
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV API_URL=http://api:3001

# Build the Next.js application for production
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm run build; \
    fi

# Expose the port that the app will run on
EXPOSE 3000

# Start the app based on environment
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run start; else npm run dev; fi"]
