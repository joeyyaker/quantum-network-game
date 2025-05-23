#!/bin/bash
# Quantum Network Game Launcher
# Double-click this file to open the game in your browser

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Open the game in the default browser
open "file://$DIR/index.html"

echo "🌌 Opening Quantum Network Game..."
echo "The game should open in your default browser."
echo "If it doesn't open automatically, you can manually open:"
echo "file://$DIR/index.html"

# Keep the terminal open for a moment so you can see the message
sleep 2
