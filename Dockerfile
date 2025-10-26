# Production stage
FROM node:18-alpine AS production

# Install pnpm and wget for healthcheck
RUN npm install -g pnpm && apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY facilitator/package.json ./facilitator/
COPY resource-server/package.json ./resource-server/
COPY client/package.json ./client/

# Install only production dependencies for workspace
RUN pnpm install --frozen-lockfile --prod

# Copy pre-built JavaScript files from local dist directories
COPY facilitator/dist ./facilitator/dist
COPY resource-server/dist ./resource-server/dist

# Create symlinks for node_modules in sub-projects
RUN ln -sf /app/node_modules /app/facilitator/node_modules
RUN ln -sf /app/node_modules /app/resource-server/node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Change ownership
RUN chown -R nodeuser:nodejs /app

USER nodeuser

# Expose ports
EXPOSE 3001 3000

# Default command will be overridden in docker-compose
CMD ["node", "--version"]