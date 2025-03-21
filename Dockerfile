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

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Remove development dependencies
RUN npm prune --production

# Set user for security
USER node

CMD ["node", "dist/index.js"] 