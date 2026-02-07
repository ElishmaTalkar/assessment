#!/bin/bash

# TaskFlow Setup Script
# This script sets up the entire project with one command

echo "🚀 TaskFlow Setup Script"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first.${NC}"
    echo "   macOS (Homebrew): brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    echo ""
    read -p "Press Enter once MongoDB is running..."
fi

# Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Seed database
echo "Seeding database with demo data..."
npm run seed
echo -e "${GREEN}✓ Database seeded${NC}"

cd ..

# Frontend Setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

cd ..

# Success message
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "Demo Credentials:"
echo "   Email: john@example.com"
echo "   Password: Password123"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
