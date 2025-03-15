#!/bin/bash

# A little script to help prepare our code for committing to GitHub
# Run this before committing to make sure everything is ready

echo "🧹 Cleaning up before commit..."

# Make sure all dependencies are installedf
echo "📦 Checking dependencies..."
cd client && npm install
cd ../server && npm install
cd ..

# Run linters
echo "🔍 Running linters..."
cd client && npm run lint
cd ../server && npm run lint
cd ..

# Build to check for errors
echo "🔨 Building to check for errors..."
cd client && npm run build
cd ../server && npm run build
cd ..

# Run tests
echo "🧪 Running tests..."
cd client && npm test -- --passWithNoTests
cd ../server && npm test -- --passWithNoTests
cd ..

echo "✅ All good! Ready to commit to GitHub."
echo ""
echo "Push to GitHub with:"
echo "  git add ."
echo "  git commit -m \"Your commit message\""
echo "  git push origin main"

# Add some personality
echo ""
echo "😎 Happy coding!" 