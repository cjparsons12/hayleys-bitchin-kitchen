#!/bin/bash

# Hayley's Bitchin' Kitchen - Stop Script
# This script stops the application and removes containers

echo "🛑 Stopping Hayley's Bitchin' Kitchen..."

# Stop the services
docker-compose down

echo "✅ Services stopped and containers removed."
echo ""
echo "💡 Note: Database data persists in Docker volume."
echo "   To reset database: docker-compose down -v"