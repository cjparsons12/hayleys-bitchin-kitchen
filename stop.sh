#!/bin/bash

# Hayley's Bitchin' Kitchen - Stop Script
# This script stops the application and removes containers

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

echo "🛑 Stopping Hayley's Bitchin' Kitchen..."

# Stop the services
docker-compose -f $COMPOSE_FILE down

echo "✅ Services stopped and containers removed."
echo ""
echo "💡 Note: Database data persists in Docker volume."
echo "   To reset database: docker-compose -f $COMPOSE_FILE down -v"