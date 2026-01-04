#!/bin/bash

# Hayley's Bitchin' Kitchen - Start Script
# This script starts the application using Docker Compose

PROD_MODE=false
COMPOSE_FILE="docker-compose.yml"

while [[ $# -gt 0 ]]; do
  case $1 in
    --prod)
      PROD_MODE=true
      COMPOSE_FILE="docker-compose.prod.yml"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "🍳 Starting Hayley's Bitchin' Kitchen..."
if [ "$PROD_MODE" = true ]; then
  echo "🏭 Production mode enabled"
else
  echo "🛠️  Development mode (with hot-reload)"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if containers are already running
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo "⚠️  Containers are already running. Use 'docker-compose -f $COMPOSE_FILE down' to stop them first."
    echo "   Or run 'docker-compose -f $COMPOSE_FILE restart' to restart."
    exit 1
fi

# Start the services
echo "🚀 Building and starting services..."
docker-compose -f $COMPOSE_FILE up --build -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are healthy
echo "🔍 Checking service status..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    # Get host IP for WSL2 users
    HOST_IP=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "localhost")
    
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access your app at:"
    if [ "$PROD_MODE" = true ]; then
        echo "   Frontend: http://localhost:80"
        if [ "$HOST_IP" != "localhost" ]; then
            echo "            http://$HOST_IP:80 (WSL2 host)"
        fi
    else
        echo "   Frontend: http://localhost:3000"
        if [ "$HOST_IP" != "localhost" ]; then
            echo "            http://$HOST_IP:3000 (WSL2 host)"
        fi
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
    if [ "$PROD_MODE" = true ]; then
        echo "🛑 To stop: ./stop.sh --prod"
    fi
    echo "📝 To view logs: docker-compose -f $COMPOSE_FILE logs -f"
else
    echo "❌ Failed to start services. Check logs with: docker-compose -f $COMPOSE_FILE logs"
    exit 1
fi