#!/bin/sh
# Block commits that include .env files (except .env.example)

blocked_files=$(git diff --cached --name-only | grep -E '(^|/)\.(env)(\..+)?$' | grep -v '\.env\.example$')

if [ -n "$blocked_files" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║              COMMIT BLOCKED — .ENV FILE              ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
  echo "  The following .env files must NOT be committed:"
  echo "$blocked_files" | sed 's/^/    ❌  /'
  echo ""
  echo "  Only .env.example files are allowed."
  echo "  Unstage them with:"
  echo "$blocked_files" | sed 's/^/    git restore --staged /'
  echo ""
  exit 1
fi
