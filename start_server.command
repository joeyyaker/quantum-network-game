#!/bin/bash
# Local Server for Quantum Network Game
# Run this to access the game from any device on your network

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Get local IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🌌 Starting Quantum Network Game Server..."
echo "📱 Access from your phone at: http://$IP:8080"
echo "💻 Access locally at: http://localhost:8080"
echo ""
echo "Make sure your phone is on the same WiFi network!"
echo "Press Ctrl+C to stop the server"
echo ""

# Start simple HTTP server
cd "$DIR"
python3 -m http.server 8080
