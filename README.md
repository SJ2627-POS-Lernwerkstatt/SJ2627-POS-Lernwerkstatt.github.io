# POS Lernwerkstatt

Self-study site for the POS Reife- und Diplomprüfung 2026/27: https://sj2627-pos-lernwerkstatt.github.io

- `SPEC.md` – what we are building and why
- `CURRICULUM.md` – modules and units
- `tasks/plan.md` – release plan
- `docs/` – cheat sheet and its errata

## Development

```bash
npm install
npm run dev      # local site
npm run check    # type and content checks
npm test
npm run build    # static site into build/
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
