#!/bin/bash

# ─────────────────────────────────────────────
#  EasyLearn — Start everything in one terminal
# ─────────────────────────────────────────────

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

# ── Edit these paths if your project is somewhere else ──
BACKEND_DIR="$HOME/EasyLearn/backend"
FRONTEND_DIR="$HOME/EasyLearn/frontend"
VENV_PATH="$BACKEND_DIR/venv/bin/activate"

# ── Log files (so output doesn't get mixed up) ──
LOG_DIR="/tmp/easylearn_logs"
mkdir -p "$LOG_DIR"
OLLAMA_LOG="$LOG_DIR/ollama.log"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# ── Track PIDs so we can kill everything cleanly ──
PIDS=()

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down EasyLearn...${RESET}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  # Kill any stragglers
  pkill -f "uvicorn main:app" 2>/dev/null
  pkill -f "react-scripts start" 2>/dev/null
  echo -e "${GREEN}All services stopped. Goodbye!${RESET}"
  exit 0
}

# Catch Ctrl+C and kill everything
trap cleanup SIGINT SIGTERM

clear
echo ""
echo -e "${BOLD}  EasyLearn — Starting up${RESET}"
echo -e "  ─────────────────────────"
echo ""

# ── 1. Start Ollama ──────────────────────────
echo -e "${BLUE}[1/3]${RESET} Starting Ollama..."
if pgrep -x "ollama" > /dev/null; then
  echo -e "      ${GREEN}Ollama is already running${RESET}"
else
  ollama serve > "$OLLAMA_LOG" 2>&1 &
  PIDS+=($!)
  sleep 2
  echo -e "      ${GREEN}Ollama started${RESET}"
fi

# ── 2. Start Backend ─────────────────────────
echo -e "${BLUE}[2/3]${RESET} Starting backend..."
if [ ! -f "$VENV_PATH" ]; then
  echo -e "      ${RED}Virtual env not found at: $VENV_PATH${RESET}"
  echo -e "      ${YELLOW}Edit VENV_PATH in this script to match your setup.${RESET}"
  cleanup
fi
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "      ${RED}Backend directory not found: $BACKEND_DIR${RESET}"
  echo -e "      ${YELLOW}Edit BACKEND_DIR in this script to match your setup.${RESET}"
  cleanup
fi
(
  cd "$BACKEND_DIR"
  source "$VENV_PATH"
  uvicorn main:app --reload --port 8000
) > "$BACKEND_LOG" 2>&1 &
PIDS+=($!)
sleep 3

# Check backend actually started
if grep -q "Application startup complete" "$BACKEND_LOG" 2>/dev/null || \
   grep -q "Uvicorn running" "$BACKEND_LOG" 2>/dev/null; then
  echo -e "      ${GREEN}Backend running on http://localhost:8000${RESET}"
else
  echo -e "      ${YELLOW}Backend starting... (check $BACKEND_LOG if issues)${RESET}"
fi

# ── 3. Start Frontend ────────────────────────
echo -e "${BLUE}[3/3]${RESET} Starting frontend..."
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "      ${RED}Frontend directory not found: $FRONTEND_DIR${RESET}"
  echo -e "      ${YELLOW}Edit FRONTEND_DIR in this script to match your setup.${RESET}"
  cleanup
fi
(
  cd "$FRONTEND_DIR"
  npm start
) > "$FRONTEND_LOG" 2>&1 &
PIDS+=($!)

echo ""
echo -e "  ─────────────────────────"
echo -e "  ${GREEN}${BOLD}All services started!${RESET}"
echo ""
echo -e "  ${BOLD}App:${RESET}     http://localhost:3000"
echo -e "  ${BOLD}API:${RESET}     http://localhost:8000"
echo -e "  ${BOLD}API docs:${RESET} http://localhost:8000/docs"
echo ""
echo -e "  ${BOLD}Logs:${RESET}"
echo -e "  Ollama   → $OLLAMA_LOG"
echo -e "  Backend  → $BACKEND_LOG"
echo -e "  Frontend → $FRONTEND_LOG"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop everything${RESET}"
echo ""

# ── Live status tail ─────────────────────────
# Show backend logs in real time so you can see errors
echo -e "─────────────── Backend log ───────────────"
tail -f "$BACKEND_LOG" &
PIDS+=($!)

# Keep the script alive
wait