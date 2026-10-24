# Status

Last updated: 2026-10-24 (end of session 2, Phase A complete). Live: https://sj2627-pos-lernwerkstatt.github.io

## Done

| Task | Result |
|---|---|
| A1 | SvelteKit 3 + adapter-static + mdsvex, prerendered; Pages deploy on push to `main` (`.github/workflows/deploy.yml`) |
| A2 | Content index (`src/lib/server/content/`): zod schemas, cross-checks; any content error fails `npm test` and the build |
| A3 | Module overview `/[module]`, unit page `/[module]/[unit]`: Shiki, callouts `:::merke/achtung/pruefung`, cheat sheet link, Entwurf badge, "Fehler melden" |
| A4 | PlantUML at build time (cached in `node_modules/.cache/plantuml`, jar pinned in CI), Mermaid lazy in the browser |
| A5 | Progress store (`src/lib/progress/`), mark as read, `/fortschritt` with export/import/reset |
| A6 | ParsonXam parser/scoring/board ported (`src/lib/puzzle/`), `Question.svelte` for single/multi/template |
| A7 | Wissenscheck at the end of each unit (instant feedback, not stored) |
| A8 | Exercise mode `/ueben`, `/ueben/[scope]`: Leitner selection, one group per page, follow-ups count only if main is right, review after the run |
| A9 | Read aloud (`src/lib/tts/`, `ReadAloud.svelte`): German voices, code announced as "Codebeispiel", highlight. Tested in Chrome (macOS) only |
| A10 | Start page with "Weiter lernen"/"Hier beginnen" and per-module progress (`src/lib/progress/summary.ts`), progress line on module pages, hidden `/review` (noindex, not linked), theme toggle System → Hell → Dunkel in the header |
| A11 | Exercise page `/[module]/uebungen/[slug]`: task Markdown, Classroom50 link or "folgt bald", rubric from frontmatter with self-rating, "abgegeben". Module pages list exercises. Sample: `jpa/exercises/01-fahrradverleih.md` (draft) |
| A12 | Playwright smoke test (`e2e/smoke.test.ts`, `npm run test:e2e` after a build) runs in CI: unit page + Wissenscheck, exercise run with reload, exercise page |

Content so far: unit `testing/01-aufbau`, 3 question groups in `src/content/questions/testing.yaml`, JPA exercise 1 (task text and rubric only), all `draft`.

## Next

1. **Phase B** (autograding): B1 Gradle seed from the 2026-09 Herbsttermin layout reduced to `Aufgabe1_ORMapping`, B2 Classroom50 spike, B3 private `loesungen` repo. See `plan.md`.
2. **Phase C** (content), starting with module testing. JPA exercise 1 still needs starter template, grading tests and sample solution (C4); its task text fixes the names grading tests compile against (`ormapping.model.Station`/`Bike`, `ormapping.persistence.StationRepository`/`BikeRepository`).
3. Small CI chores when convenient: `actions/setup-java@v5`, newer `deploy-pages` (Node 20 deprecation warnings).

## Decisions taken in session 1 (beyond SPEC.md)

- Exercise mode shows a question group on **one page**; follow-ups count only if the main question is right (no leak during the run).
- Wissenscheck: follow-ups open after the main question was checked, right or wrong.
- Leitner: new + correct → box 2; wrong → box 1; correct → +1 up to 4.
- Question text uses a small Markdown subset rendered at build time (`src/lib/server/content/text.ts`) instead of a Markdown library.
- Cheat sheet PDF is never in the repo; link to the private URL (`src/lib/content/links.ts`). It was purged from git history.
- Primary buttons use `--on-primary` (dark text on the light dark-mode primary) for contrast.

## Decisions taken in session 2

- Exercise rubric lives in frontmatter: `rubric: { erwartet, genuegend, befriedigend, gut, sehrGut }`, all required, Markdown subset.
- `selfRating` is the Austrian grade: 1 = Sehr gut … 4 = Genügend; no rating = Nicht genügend / not rated. Schema unchanged.
- "Weiter lernen" = first unread core unit in course order, then the first unread Vertiefung.
- The theme toggle cycles System → Hell → Dunkel; `settings.theme` stores the choice.

## Gotchas

- SvelteKit 3: `$app/env` (not `$app/environment`); config lives in `vite.config.ts`; `#lib/*` imports need a `.js` extension, files under `scripts/` are imported with `.ts`.
- `vite preview` caches the file list at start: restart it after every `npm run build`.
- Local dev needs `plantuml` on the PATH (Homebrew) or `PLANTUML_JAR`.
- Progress store loads in the root layout's `onMount`, so prerendered markup hydrates with empty progress first. Never mutate `$state` during render (create run answers when navigating, see `prepare()` in the run page).
- The Playwright smoke test uses real content (first group of `testing/aufbau` is a single question with a follow-up; `jpa/uebungen/fahrradverleih` exists). Adjust `e2e/smoke.test.ts` if that content changes.
- Radios inside a card label need `aria-labelledby` on the tier name, otherwise their accessible name is the whole card.
- Branch deletion and force pushes are blocked by the permission check unless the user approves them.
