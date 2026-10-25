#!/usr/bin/env bash
# ==============================================================================
# Mydobby - Local Test & Development Server Launcher
# Build With AI: Basics Hackathon
# ==============================================================================

set -e

# ANSI color codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
RESET='\033[0m'
BOLD='\033[1m'

echo -e "${PURPLE}==================================================================${RESET}"
echo -e "${BOLD}${CYAN}   🌸  Mydobby — Build With AI: Basics Hackathon  🌸${RESET}"
echo -e "${PURPLE}==================================================================${RESET}"
echo ""

# 1. Check Node.js version
echo -e "${CYAN}▶ Checking Node.js environment...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}✗ Error: Node.js is not installed. Please install Node.js (v18+) to run Mydobby.${RESET}"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "  ${GREEN}✓ Node.js detected: ${NODE_VER}${RESET}"

# 2. Check dependencies
echo -e "\n${CYAN}▶ Verifying package dependencies...${RESET}"
if [ ! -d "node_modules" ] || [ ! -d "mydobby/node_modules" ]; then
    echo -e "  Installing dependencies..."
    npm install
fi
echo -e "  ${GREEN}✓ Dependencies verified${RESET}"

# 3. Run Supabase & Environment Diagnostics
echo -e "\n${CYAN}▶ Running Cloud & Supabase Diagnostics...${RESET}"
node test-supabase.js

# 4. Start Development Server
echo -e "${CYAN}▶ Starting Next.js development server...${RESET}"
echo -e "  ${BOLD}Local URL:${RESET}  ${GREEN}http://localhost:3000${RESET}"
echo -e "  ${BOLD}Host URL:${RESET}   ${GREEN}http://0.0.0.0:3000${RESET}"
echo -e "\n${PURPLE}Press Ctrl+C at any time to stop the server.${RESET}\n"

exec npm run dev
