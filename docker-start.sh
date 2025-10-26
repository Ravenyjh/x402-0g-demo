#!/bin/bash

# x402 0g Chain Demo Docker Startup Script

echo "🐳 Starting x402 0g Chain Demo with Docker..."

# Check if .env files exist
if [ ! -f "facilitator/.env" ]; then
    echo "⚠️  Warning: facilitator/.env not found"
    echo "   Please copy facilitator/.env.example to facilitator/.env and configure it"
fi

if [ ! -f "resource-server/.env" ]; then
    echo "⚠️  Warning: resource-server/.env not found"
    echo "   Please copy resource-server/.env.example to resource-server/.env and configure it"
fi

# Build and start services
echo "🔨 Building Docker images..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

echo "✅ Services started!"
echo ""
echo "📋 Service URLs:"
echo "   🔗 Facilitator: http://localhost:3001"
echo "   🔗 Resource Server: http://localhost:3000"
echo ""
echo "📊 View logs: docker compose logs -f"
echo "🛑 Stop services: docker compose down"