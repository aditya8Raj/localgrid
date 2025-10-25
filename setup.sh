#!/bin/bash

# LocalGrid Setup Script
# This script helps you set up the LocalGrid development environment

set -e

echo "🚀 LocalGrid Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please update the .env file with your configuration:"
    echo "   - DATABASE_URL (from Neon)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)"
    echo ""
    read -p "Press Enter once you've updated the .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""

# Setup database
echo "🗄️  Setting up database..."
echo ""

read -p "Have you configured your DATABASE_URL in .env? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing database schema..."
    npm run db:push
    echo ""
    echo "✅ Database setup complete!"
else
    echo "⚠️  Please configure your DATABASE_URL in .env and run: npm run db:push"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file with all required credentials"
echo "2. Set up OAuth applications (Google & GitHub)"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""
