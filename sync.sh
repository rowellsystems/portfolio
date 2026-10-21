#!/usr/bin/env bash
# Copy the built portfolio from ~/Documents into this repo, then commit and push.
# This repo is PUBLIC and is served at https://rowellsystems.com by GitHub Pages.
# Source of truth: the _Portfolio Site folder below (run build.py there first).
# Usage: ./sync.sh            (sync, commit, push)
#        ./sync.sh --dry-run  (show what would change, no commit)
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
INV="$HOME/Documents/2 Areas/09 George Bret Rowell - Portfolio (Inventions, Writing, Clinics)/_Portfolio Site"

DRY=""
[[ "${1:-}" == "--dry-run" ]] && DRY="--dry-run"

# Only the built page and its images go public (not sources or Coroflot exports).
for d in pages art covers; do
  rsync -a --delete $DRY --exclude '.*' "$INV/$d/" "$REPO/$d/"
done
rsync -a $DRY "$INV/index.html" "$REPO/index.html"

cd "$REPO"
[[ -n "$DRY" ]] && { git status --short; exit 0; }

# Privacy check: refuse to publish if a private name slips into the text.
if grep -rIilE 'sorel|michael|wright|ingersoll|mikesoreljr' --exclude=sync.sh --exclude-dir=.git . ; then
  echo "STOPPED: private name found in the files above. Nothing pushed." >&2
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "Nothing changed."
  exit 0
fi
git commit -m "Sync portfolio from ~/Documents ($(date +%F))" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
