# Glossary of Research Terms

A live, browsable **glossary site** powered by **React, Vite, and IBM Carbon Design System**.  
Includes terms scraped from *Williamson, K. and Johanson, G. (eds) (2018) Research Methods: Information, Systems, and Contexts. 2nd edn.* plus user-added custom entries.

Live version: [https://munomono.github.io/glossary-of-research-terms/](https://munomono.github.io/glossary-of-research-terms/)

---

## 📚 About

This repository provides an interactive glossary of research methods and concepts.  
Official terms are extracted from the Williamson & Johanson (2018) glossary, and additional custom terms can be added by the user (clearly tagged in the UI).

- **Data sources**: 
  - `public/docs/index.json` (scraped official terms)  
  - `public/docs/custom.json` (user-added entries)  
- **Framework**: React + Vite  
- **UI**: IBM Carbon Design System (`@carbon/react`, `@carbon/styles`)  
- **Features**:
  - A–Z navigation pills with counts
  - Clean entry list using semantic definition lists (<dl><dt><dd>)
  - Search & filter across all terms
  - Dedicated per-letter pages with breadcrumbs
  - Highlighting for search matches
  - Custom entries marked with purple tags
  - Light/dark theme toggle
  - Deployable on GitHub Pages

---

## 🚀 Usage

### View online
[https://munomono.github.io/glossary-of-research-terms/](https://munomono.github.io/glossary-of-research-terms/)

### Run locally

```bash
git clone https://github.com/MunoMono/glossary-of-research-terms.git
cd glossary-of-research-terms
npm install
npm run dev
```

Open [http://localhost:5173/glossary-of-research-terms](http://localhost:5173/glossary-of-research-terms).

### Build for production

```bash
npm run build
npm run preview
```

---

## 📝 Workflow Cheatsheet

### 1. Add a new custom term

```bash
# edit custom.json manually, or create a helper script later
```

- Custom entries are stored in `public/docs/custom.json`.  
- They appear alongside official glossary terms with a purple “Custom” tag.

### 2. Develop locally

```bash
npm run dev
```

- Starts dev server.  
- Open [http://localhost:5173/glossary-of-research-terms](http://localhost:5173/glossary-of-research-terms).  

### 3. Deploy to GitHub Pages

```bash
./scripts/push-deploy.sh "deploy: latest glossary"
```

- Builds `index.json` (if needed)  
- Builds site into `dist/`  
- Publishes with `.nojekyll` to `gh-pages`  

---

## 🛠 Development

Key source files:

- `src/App.jsx` — main app & router
- `src/pages/Glossary.jsx` — A–Z entry list, search, and per-letter links
- `src/pages/Letter.jsx` — dedicated letter page with breadcrumb navigation
- `scripts/pdf_to_json.py` — parses Williamson & Johanson glossary PDF into JSON
- `public/docs/index.json` — scraped official glossary entries
- `public/docs/custom.json` — user-added custom entries
- `src/styles/index.scss` — Carbon + global overrides

---

## 🔖 License

- Glossary data: from Williamson & Johanson (2018), academic fair use  
- Application code + configs: [MIT](./LICENSE)  
