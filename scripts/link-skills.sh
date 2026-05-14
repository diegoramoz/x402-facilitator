#!/usr/bin/env bash
# Symlinks all skills from .agents/skills/ into .claude/skills/ so Claude Code
# can discover them. Skills are the canonical source of truth in .agents/skills/;
# .claude/skills/ holds only relative symlinks pointing back to them.
#
# Usage: ./scripts/link-skills.sh
# Run whenever a new skill is added to .agents/skills/.
set -euo pipefail

# Resolve paths relative to this script's location so it works from any cwd.
AGENTS_SKILLS="$(dirname "$0")/../.agents/skills"
CLAUDE_SKILLS="$(dirname "$0")/../.claude/skills"

# Ensure the target directory exists before writing symlinks into it.
mkdir -p "$CLAUDE_SKILLS"

for skill in "$AGENTS_SKILLS"/*/; do
  name="$(basename "$skill")"
  target="$CLAUDE_SKILLS/$name"

  # Skip if a symlink or real file already exists at the target path.
  if [ -e "$target" ] || [ -L "$target" ]; then
    echo "skip: $name"
  else
    # Use a relative path so the symlink stays valid after the repo is moved.
    ln -s "../../.agents/skills/$name" "$target"
    echo "linked: $name"
  fi
done
