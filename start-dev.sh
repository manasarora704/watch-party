#!/bin/bash
# Watchio Development Server Startup Script

echo "🎬 Starting Watchio Watch Party System..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start backend server in background
echo "🔌 Starting Socket.IO server on port 4000..."
npm run dev:server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in separate terminal (if possible)
echo "🎨 Starting React frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Display info
echo ""
echo "✨ Watchio is running!"
echo "───────────────────────────"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:4000"
echo "💬 Socket:   ws://localhost:4000"
echo ""
echo "📝 Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
