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

# Create data directory and database file with proper permissions
RUN mkdir -p /app/data && \
    touch /app/data/f1bot.db && \
    chown -R node:node /app/data /app/data/f1bot.db && \
    chmod 755 /app/data && \
    chmod 644 /app/data/f1bot.db

# Remove development dependencies
RUN npm prune --production

# Set user for security
USER node

# Run the application
CMD ["node", "dist/index.js"] 