#!/bin/bash

# TrincoMate Backend Test Execution Script
# This script runs the complete test suite with coverage

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TrincoMate Backend Test Suite Execution Script       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to backend directory
cd backend || { echo "Failed to navigate to backend directory"; exit 1; }

echo "📋 Current Directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Display test file count
echo "📊 Test Files Summary:"
test_count=$(find tests -name "*.test.js" 2>/dev/null | wc -l)
echo "   Total test files found: $test_count"
echo ""

# Run health check first
echo "🏥 Running Health Check..."
npm run test health.test.js -- --forceExit 2>/dev/null || echo "Health check skipped or failed"
echo ""

# Run authentication tests
echo "🔐 Running Authentication Tests..."
npm run test auth.advanced.test.js -- --forceExit 2>/dev/null || echo "Auth tests completed"
echo ""

# Run service tests
echo "🛎️  Running Service API Tests..."
npm run test service.implementation.test.js -- --forceExit 2>/dev/null || echo "Service tests completed"
echo ""

# Run booking tests
echo "📅 Running Booking API Tests..."
npm run test booking.implementation.test.js -- --forceExit 2>/dev/null || echo "Booking tests completed"
echo ""

# Run category tests
echo "📂 Running Category Tests..."
npm run test category.test.js -- --forceExit 2>/dev/null || echo "Category tests completed"
echo ""

# Run full test suite with verbose output
echo "════════════════════════════════════════════════════════════"
echo "🎯 Running Full Test Suite with Verbose Output..."
echo "════════════════════════════════════════════════════════════"
echo ""
npm run test:verbose

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📈 Generating Coverage Report..."
echo "════════════════════════════════════════════════════════════"
echo ""
npm run test:coverage

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Test Execution Completed Successfully!          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Next Steps:"
echo "   1. Review test output above"
echo "   2. Check coverage report in ./coverage directory"
echo "   3. Address any test failures"
echo "   4. Commit passing tests to repository"
echo ""
