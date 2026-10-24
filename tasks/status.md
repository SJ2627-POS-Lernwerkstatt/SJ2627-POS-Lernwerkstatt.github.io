# Status

Last updated: 2026-10-24 (end of session 2: Phases A and B, C1 and C2 complete). Live: https://sj2627-pos-lernwerkstatt.github.io

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
| B1 | Seed in `loesungen/seed`: Herbsttermin 2026-09 on Java 25, `build/` inside the project. `scripts/assemble.py` reduces it to the subprojects an exercise needs |
| B2 | `loesungen/autograder/autograder.py` + Classroom50 assignment `jpa-01-fahrradverleih` (runtime `java: 25`, template `vorlage-jpa-01-fahrradverleih`, public). Spike in test repo `lernwerkstatt-jpa-01-fahrradverleih-mfreimueller`: 15/17, 17/17 and the compile-error case all correct in the Release, ~3 min per run |
| B3 | Private repo `SJ2627-POS-Lernwerkstatt/loesungen` (local: `../POS_Lernwerkstatt_Loesungen`), CI runs `scripts/check.py` per exercise: solution full points, vorlage 0, mutants fail the listed tests |
| C1 | Module testing: units 01–15 (13–15 Vertiefung), 30 question groups in `testing.yaml`, all `draft` |
| C2 | Module streams: units 01–10 (10 Vertiefung), 30 question groups in `streams.yaml`, all `draft` |

Content so far: unit `testing/01-aufbau`, 3 question groups in `src/content/questions/testing.yaml`, JPA exercise 1 (site text `draft`; starter, solution and grading tests in `loesungen`, assignment registered but unlisted), all units and questions `draft`.

## Next

1. **C3** JPA units 1–10 (CURRICULUM.md). Started only as groundwork: a scratch project verified the mappings on Hibernate 7.4 / H2 (findings below). No unit written yet.
2. **Update `vorlage-jpa-01-fahrradverleih`** with the H2 pin from `loesungen/seed` (rebuild with `assemble.py vorlage` and push). Not done yet.
3. **C4** JPA exercise 2 in `loesungen/exercises/`, same steps as exercise 1 (bundle → classroom50, public `vorlage-…`, `gh teacher assignment add … --runtime`).
4. **D2** accept links from the Classroom50 web UI into `classroomUrl`.
5. CI chores: `actions/setup-java@v5`, newer `deploy-pages`.

### Verified facts for C3 (Hibernate 7.4.5, H2, Spring Boot 4.1.1)

- **H2 2.4.240 bug** (Boot's default): a string `CHECK (x in (...))` created over one connection fails with "Check constraint invalid" once that connection is closed. `@DataJpaTest` uses a non-pooled embedded DataSource, so every enum mapped with an `AttributeConverter` breaks on insert. Fixed in H2 2.5.252 (pinned in `loesungen/seed`). Workaround without the pin: `@AutoConfigureTestDatabase(replace = NONE)`. `length`/`columnDefinition` do not help. Decision: pin + warn in JPA unit 6.
- Enum without annotation → `tinyint` ordinal with `check (x between 0 and n)`; `@Enumerated(STRING)` → native H2 `enum('A','B')` column; converter → `varchar(255)` + string check of the codes.
- Converters **are** called with `null` (both directions) → null-safe converters are required.
- `@Embedded` without naming → plain column names (`city`, `street`); `@EmbeddedColumnNaming("home_%s")` (Hibernate annotation) and `@AttributeOverrides` both work.
- Bean Validation inside an `@Embeddable` (record) is **not** applied without `@Valid` on the embedded field (to verify with `@Valid` before writing unit 7).
- Default `@GeneratedValue` → sequence `<table>_seq` with increment 50. `AbstractPersistable.isNew()` is true before save.
- Named constraints: `@UniqueConstraint(name = ...)` appears in the exception message; `@JoinColumn(foreignKey = @ForeignKey(name = ...))` creates the named FK.
- Without `em.flush(); em.clear();` `findById` returns the same instance (first-level cache) → lifecycle tests should flush/clear.
- Packages: `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, `org.springframework.boot.jpa.test.autoconfigure.TestEntityManager`.

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

## Decisions taken in session 2 (Phase B)

- Java 25 everywhere (the seed's 26 was changed), Spring Boot 4.1.1 and Gradle 9.7.1 as in the seed.
- Seed master copy in `loesungen/seed`; template repos are public; `build/` folders stay inside the project.
- Grading tests live in `<root package>.grading` (e.g. `ormapping.grading`), not `grading`, so `@DataJpaTest` finds the application class. Test names come from `@DisplayName` and are the keys in `weights.json`.
- JPA exercise 1: 14 grading tests, 17 points (one exam task).

## Content workflow (C1, C2)

- Every Java example is run first in a scratch Gradle project built from the seed (`Aufgabe2_BusinessService` for plain Java, `Aufgabe1_ORMapping` for JPA); claims like "this fails" are checked too. Two claims were wrong before checking (static `@Nested`, an AssertJ message) and were fixed.
- One commit per batch of units with their questions, deployed per batch. Run the Playwright smoke test as its own command and check its exit code (a piped `tail` once hid a failure).

## Gotchas

- SvelteKit 3: `$app/env` (not `$app/environment`); config lives in `vite.config.ts`; `#lib/*` imports need a `.js` extension, files under `scripts/` are imported with `.ts`.
- `vite preview` caches the file list at start: restart it after every `npm run build`.
- Local dev needs `plantuml` on the PATH (Homebrew) or `PLANTUML_JAR`.
- Progress store loads in the root layout's `onMount`, so prerendered markup hydrates with empty progress first. Never mutate `$state` during render (create run answers when navigating, see `prepare()` in the run page).
- The Playwright smoke test uses real content (first group of `testing/aufbau` is a single question with a follow-up; `jpa/uebungen/fahrradverleih` exists). Adjust `e2e/smoke.test.ts` if that content changes.
- Radios inside a card label need `aria-labelledby` on the tier name, otherwise their accessible name is the whole card.
- Grading tests run with `@Transactional(propagation = NOT_SUPPORTED)` and `deleteAll()` in `@BeforeEach`: each save is its own transaction, so a rejected save does not break the next check.
- Classroom50: `gh teacher` needs scopes `admin:org` etc. (`gh teacher login`, interactive). Student repos must stay private, public ones are not autograded.
- Students need a local JDK 25; the seed has no toolchain auto-download (open question for the user: add the foojay resolver?).
- Branch deletion and force pushes are blocked by the permission check unless the user approves them.
