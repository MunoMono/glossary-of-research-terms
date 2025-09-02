# Glossary of Research Terms

A React + Vite + Carbon Design System app to browse and search research glossary terms.  
Includes terms scraped from *Williamson, K. and Johanson, G. (eds) (2018) Research Methods: Information, Systems, and Contexts (2nd edn.)* plus custom user entries.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install dependencies
```bash
npm install
```

### Run locally
```bash
npm run dev
```
The app will open at [http://localhost:5173/glossary-of-research-terms](http://localhost:5173/glossary-of-research-terms).

---

## 📦 Build
```bash
npm run build
```

Output goes to `dist/`.

---

## 🌐 Deployment (GitHub Pages)

This project is configured to deploy via GitHub Actions → `gh-pages` branch.

### Steps
1. Push your code to `main`.
2. Enable GitHub Pages:
   - Go to your repo → **Settings → Pages**.
   - Select **Deploy from branch**.
   - Choose branch = `gh-pages`, folder = `/ (root)`.

Your site will be available at:
```
https://<your-username>.github.io/glossary-of-research-terms/
```

---

## ⚙️ GitHub Actions

The workflow is already configured to:
- Install dependencies
- Build with Vite
- Deploy to `gh-pages`

Add a `.github/workflows/deploy.yml` with:

```yaml
name: Deploy Glossary to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

---

## ✨ Features
- Browse glossary A–Z
- Filter/search terms live
- Dedicated per-letter pages with breadcrumbs
- Highlighting and custom tags for added terms
- Dark/light theme toggle via Carbon

---

## 📜 License
MIT
