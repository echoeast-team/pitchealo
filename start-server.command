#!/bin/bash
# Double-click to run the Pitchealo site locally at http://127.0.0.1:4321
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.homebrew/bin:$HOME/.volta/bin:$PATH"
PORT=4321
URL="http://127.0.0.1:$PORT"

up() { curl -s -o /dev/null --max-time 1 "$URL/"; }

echo ""
echo "  Pitchealo local server"
echo "  ----------------------"

if up; then
  echo "  Already running at $URL"
  open "$URL"
  exit 0
fi

PID=""
if command -v node >/dev/null 2>&1; then
  echo "  Starting with Node ($(command -v node))"
  node server.js "$PORT" &
  PID=$!
elif python3 -c 'import http.server' >/dev/null 2>&1; then
  echo "  Starting with Python ($(command -v python3))"
  python3 -m http.server "$PORT" --bind 127.0.0.1 &
  PID=$!
fi

# wait up to 10 seconds for the server to answer
for _ in $(seq 1 50); do up && break; sleep 0.2; done

if up; then
  trap 'kill $PID 2>/dev/null' EXIT INT TERM
  echo ""
  echo "  Running at $URL"
  echo "  Keep this window open. Close it (or press Ctrl+C) to stop the server."
  echo ""
  open "$URL"
  wait "$PID"
else
  [ -n "$PID" ] && kill "$PID" 2>/dev/null
  echo ""
  echo "  Couldn't start a local server (Node or Python wasn't available)."
  echo "  Opening index.html directly instead; the site works the same from the file."
  open "index.html"
  echo ""
  read -r -p "  Press Enter to close this window."
fi
