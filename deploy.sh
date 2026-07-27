#!/usr/bin/env bash
# Deploy to GitHub Pages. Run from this folder, on your own machine, with your own
# token — that way the token never travels through a chat log.
#
#   ./deploy.sh ASIMKARD/spider-man
#
# Needs: git, and either the `gh` CLI already authenticated, or GITHUB_TOKEN set
# to a fine-grained PAT with Contents: read and write on this one repository.
set -euo pipefail
REPO="${1:?usage: ./deploy.sh OWNER/REPO}"
MSG="${2:-Deploy Spider-Man reading-order tracker}"

# refuse to ship a stale cache version
CUR=$(grep -oE "spider-man-v[0-9]+" sw.js | head -1)
echo "Service worker cache version: $CUR"
read -r -p "Did you bump this since the last deploy? [y/N] " ok
[[ "$ok" =~ ^[Yy]$ ]] || { echo "Bump CACHE in sw.js first."; exit 1; }

TMP=$(mktemp -d)
cp -r ./* ./.nojekyll "$TMP"/ 2>/dev/null || true
cd "$TMP"
git init -q
git add -A
git -c user.email=deploy@local -c user.name=deploy commit -qm "$MSG"
git branch -M main

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git"
else
  gh auth status >/dev/null
  git remote add origin "https://github.com/${REPO}.git"
fi

git push -f origin main
echo
echo "Pushed. In the repo: Settings -> Pages -> Source: deploy from branch 'main', folder '/ (root)'."
echo "Live at https://${REPO%%/*}.github.io/${REPO##*/}/ within a minute or two."
rm -rf "$TMP"
