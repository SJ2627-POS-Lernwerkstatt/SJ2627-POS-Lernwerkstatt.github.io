# POS Lernwerkstatt

Self-study site for the POS Reife- und Diplomprüfung 2026/27: https://sj2627-pos-lernwerkstatt.github.io

- `SPEC.md` – what we are building and why
- `CURRICULUM.md` – modules and units
- `tasks/plan.md` – release plan
- `docs/` – errata for the [cheat sheet](https://studious-system-8e43kky.pages.github.io/POS_Java_CheatSheet.pdf) (hosted privately, not in this repo)

## Development

Needs Node 22 and [PlantUML](https://plantuml.com) (`brew install plantuml`, or set `PLANTUML_JAR` to a plantuml.jar) because diagrams are rendered at build time.

```bash
npm install
npm run dev      # local site
npm run check    # type and content checks
npm test
npm run build    # static site into build/
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Lernwerkstatt-Login

The optional login (weekly quests, sync) is built in only if the repository variable `API_URL` is set (GitHub: Settings, Secrets and variables, Actions, Variables) to `https://<domain>/api`. Unset or empty: the login is hidden and the site works as before. The backend's `ALLOWED_ORIGINS` must contain the Pages origin. The app is installable as a PWA (manifest, service worker); with login enabled it starts at `/woche`.
