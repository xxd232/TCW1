#!/bin/bash

# TCW1 Build Script
# Usage: bash deploy.sh <backend|frontend|both>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== TCW1 Build Script ==========${NC}"

# Build Backend
build_backend() {
    echo -e "${BLUE}Building Backend...${NC}"
    
    cd backend
    
    # Install dependencies
    npm ci
    
    # Build TypeScript
    npm run build
    
    cd ..
    
    echo -e "${GREEN}✓ Backend built successfully${NC}"
}

# Build Frontend
build_frontend() {
    echo -e "${BLUE}Building Frontend...${NC}"
    
    cd frontend
    
    # Install dependencies
    npm ci
    
    # Build React app
    npm run build
    
    cd ..
    
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
}

# Main build logic
case "${1:-both}" in
    backend)
        build_backend
        ;;
    frontend)
        build_frontend
        ;;
    both)
        build_backend
        build_frontend
        ;;
    *)
        echo -e "${RED}Usage: bash deploy.sh <backend|frontend|both>${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}========== Build Complete! ==========${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Deploy your built files to your hosting provider"
echo "2. Set environment variables on your hosting platform"
echo "3. Configure SSL certificate"
echo "4. Test your deployment"
