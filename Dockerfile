FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and tsconfig
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Create data directory for SQLite database with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data && \
    chmod 755 /app/data

# Remove development dependencies
RUN npm prune --production

# Set user for security
USER node

# Make sure the entrypoint creates the DB file with proper permissions
CMD ["sh", "-c", "touch /app/data/f1bot.db && node dist/index.js"] 