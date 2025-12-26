#!/bin/bash

# Hayley's Bitchin' Kitchen - Start Script
# This script starts the application using Docker Compose

echo "🍳 Starting Hayley's Bitchin' Kitchen..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if containers are already running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Containers are already running. Use 'docker-compose down' to stop them first."
    echo "   Or run 'docker-compose restart' to restart."
    exit 1
fi

# Start the services
echo "🚀 Building and starting services..."
docker-compose up --build -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are healthy
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    # Get host IP for WSL2 users
    HOST_IP=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "localhost")
    
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access your app at:"
    echo "   Frontend: http://localhost:3000"
    if [ "$HOST_IP" != "localhost" ]; then
        echo "            http://$HOST_IP:3000 (WSL2 host)"
    fi
    echo "   Backend API: http://localhost:8000"
    if [ "$HOST_IP" != "localhost" ]; then
        echo "               http://$HOST_IP:8000 (WSL2 host)"
    fi
    echo "   API Docs: http://localhost:8000/docs"
    if [ "$HOST_IP" != "localhost" ]; then
        echo "            http://$HOST_IP:8000/docs (WSL2 host)"
    fi
    echo ""
    echo "🛑 To stop: ./stop.sh"
    echo "📝 To view logs: docker-compose logs -f"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi