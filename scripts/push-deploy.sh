#!/usr/bin/env bash
# scripts/push-deploy.sh
set -euo pipefail
umask 022

# Optional commit message (default if omitted)
MSG="${1:-chore: deploy latest changes}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Git add/commit/push (branch: main)"
git add .
if git diff --cached --quiet; then
  echo "==> No staged changes to commit."
else
  git commit -m "$MSG" || true
fi
git push origin main

echo "==> Ensure public/.nojekyll exists (disables Jekyll on GH Pages)"
touch public/.nojekyll

echo "==> Install gh-pages if missing"
if ! npx --yes gh-pages --version >/dev/null 2>&1; then
  npm i -D gh-pages
fi

echo "==> Clean previous gh-pages cache"
npx gh-pages-clean || true

echo "==> Build glossary index + site"
npm run build
# (no docs-index step — glossary JSON is prebuilt)

echo "==> Copy .nojekyll into dist/"
cp -f public/.nojekyll dist/.nojekyll

echo "==> Publish dist/ to gh-pages (with dotfiles, force)"
npx gh-pages -d dist -b gh-pages -f --dotfiles -m "deploy: publish dist with md + .nojekyll"

echo "==> Done. Visit:"
echo "    https://munomono.github.io/glossary-of-research-terms/"