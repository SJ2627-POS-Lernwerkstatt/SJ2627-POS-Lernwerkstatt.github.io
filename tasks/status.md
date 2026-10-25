# Status

Last updated: 2026-10-25 (session 4: D2, CI chores, foojay). Live: https://sj2627-pos-lernwerkstatt.github.io

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
| A9 | Read aloud – **removed** on 2026-10-24 at the user's request (did not work as expected). Old progress exports with `settings.voice`/`rate` still import (keys are stripped) |
| A10 | Start page with "Weiter lernen"/"Hier beginnen" and per-module progress (`src/lib/progress/summary.ts`), progress line on module pages, hidden `/review` (noindex, not linked), theme toggle System → Hell → Dunkel in the header |
| A11 | Exercise page `/[module]/uebungen/[slug]`: task Markdown, Classroom50 link or "folgt bald", rubric from frontmatter with self-rating, "abgegeben". Module pages list exercises. Sample: `jpa/exercises/01-fahrradverleih.md` (draft) |
| A12 | Playwright smoke test (`e2e/smoke.test.ts`, `npm run test:e2e` after a build) runs in CI: unit page + Wissenscheck, exercise run with reload, exercise page |
| B1 | Seed in `loesungen/seed`: Herbsttermin 2026-09 on Java 25, `build/` inside the project. `scripts/assemble.py` reduces it to the subprojects an exercise needs |
| B2 | `loesungen/autograder/autograder.py` + Classroom50 assignment `jpa-01-fahrradverleih` (runtime `java: 25`, template `vorlage-jpa-01-fahrradverleih`, public). Spike in test repo `lernwerkstatt-jpa-01-fahrradverleih-mfreimueller`: 15/17, 17/17 and the compile-error case all correct in the Release, ~3 min per run |
| B3 | Private repo `SJ2627-POS-Lernwerkstatt/loesungen` (local: `../POS_Lernwerkstatt_Loesungen`), CI runs `scripts/check.py` per exercise: solution full points, vorlage 0, mutants fail the listed tests |
| C1 | Module testing: units 01–15 (13–15 Vertiefung), 30 question groups in `testing.yaml`, all `draft` |
| C2 | Module streams: units 01–10 (10 Vertiefung), 30 question groups in `streams.yaml`, all `draft` |
| C3 | Module jpa: units 01–10, 25 question groups in `jpa.yaml`, all `draft`. Running example: library (`Branch`, `Book`, `Address`, `Isbn`, `Genre`, `RoomName` from the exam) |
| C4 | JPA exercise 2 `jpa-02-fahrradverleih-beziehungen` (site page `jpa/exercises/02-fahrradverleih-beziehungen.md`, draft): Address as Value Object with `@Valid`, `BikeType` with codes + `BikeTypeConverter`, rich type `InventoryNumber`, bidirectional Station–Bike (cascade PERSIST, no orphanRemoval, `fk_bike_station`). Starter = exercise 1 solution (user decision). 17 grading tests, 22 points; check.py: solution 22/22, vorlage 0, 11 mutants. Public template `vorlage-jpa-02-fahrradverleih-beziehungen`, bundle in `classroom50`, assignment registered (invite link only). Not spiked with a real student repo yet |
| — | `vorlage-jpa-01-fahrradverleih` updated with the H2 pin |
| — | JPA units 2–4, 6–10: UML diagrams in exam notation; unit 3: Lombok section (verified: both constructor annotations on a class without own fields fail with "Konstruktor X() ist bereits … definiert"; `@AllArgsConstructor` takes only own fields incl. lists; `@Data` replaces AbstractPersistable's equals and warns). Lombok needs `compileOnly`/`annotationProcessor("org.projectlombok:lombok")`, not in the seed |
| D2 | Classroom50 accept links in `classroomUrl` of both JPA exercises (`…/lernwerkstatt/assignments/<slug>/accept`) |
| — | CI: actions on current majors (checkout 7, setup-node 7, setup-java 6, cache 6, upload-artifact 7, upload-pages-artifact 5, deploy-pages 5), also in `loesungen` |
| — | Seed: foojay resolver 1.0.0 in `settings.gradle.kts` and `buildSrc/settings.gradle.kts` (there without version, it is already on the classpath). Verified with an empty Gradle home and `auto-detect=false`: Temurin 25 is downloaded, exercise 2 tests pass. Both template repos updated |
| — | Collapsible side panel with the course structure (`CourseNav.svelte`, `lib/sidebar.ts`, root `+layout.server.ts`); state applied before first paint in `app.html`; smoke test added |

Content so far: testing 15 units, streams 10, jpa 10 (85 question groups); JPA exercises 1 and 2 (site text `draft`; starter, solution and grading tests in `loesungen`, assignments linked from the site). All content `draft`.

## Next

Session 5 (2026-10-25, cut off by usage limit): Vertiefung units dropped; JPA units 11–18 + 16 question groups committed (not pushed).
Exercise 3 `jpa-03-paketdienst` in `loesungen` (committed locally, not pushed): solution, sample tests, grading tests (28 points), check --quick passes. Lab project with verified facts: scratchpad only.

1. Exercise 3: `mutants.json`, full `check.py`, site page `jpa/exercises/03-paketdienst.md`, template repo, classroom50 bundle + `gh teacher assignment add`, `classroomUrl`.
2. Exercise 4 (exam-sized, like PLÜ 2025-12-03 task 1): planned domain "Konferenz": Person + abstract PersonRole → Speaker/Attendee (rich-type codes), Session (format enum with codes, embedded Room, speakers m:n), TimeSlot composition with attendees m:n; queries: findByLastNameIgnoreCase, projection with concatenated room number + seats, sessions by floor, attendee count per session.
3. Push both repos, deploy, update this file.
4. Optionally spike exercise 2 with a real student repo. Phase D1/D3 after the review.

### Verified facts for JPA (Hibernate 7.4.5, H2, Spring Boot 4.1.1)

- **H2 2.4.240 bug** (Boot's default): a string `CHECK (x in (...))` created over one connection fails with "Check constraint invalid" once that connection is closed. `@DataJpaTest` uses a non-pooled embedded DataSource, so every enum mapped with an `AttributeConverter` breaks on insert. Fixed in H2 2.5.252 (pinned in `loesungen/seed`). Workaround without the pin: `@AutoConfigureTestDatabase(replace = NONE)`. `length`/`columnDefinition` do not help. Decision: pin + warn in JPA unit 6.
- Enum without annotation → `tinyint` ordinal with `check (x between 0 and n)`; `@Enumerated(STRING)` → native H2 `enum('A','B')` column; converter → `varchar(255)` + string check of the codes.
- Converters **are** called with `null` (both directions) → null-safe converters are required.
- `@Embedded` without naming → plain column names (`city`, `street`); `@EmbeddedColumnNaming("home_%s")` (Hibernate annotation) and `@AttributeOverrides` both work.
- Bean Validation inside an `@Embeddable` (record) is **not** applied without `@Valid` on the embedded field (to verify with `@Valid` before writing unit 7).
- Default `@GeneratedValue` → sequence `<table>_seq` with increment 50. `AbstractPersistable.isNew()` is true before save.
- Named constraints: `@UniqueConstraint(name = ...)` appears in the exception message; `@JoinColumn(foreignKey = @ForeignKey(name = ...))` creates the named FK.
- Without `em.flush(); em.clear();` `findById` returns the same instance (first-level cache) → lifecycle tests should flush/clear.
- Packages: `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, `org.springframework.boot.jpa.test.autoconfigure.TestEntityManager`, `org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase`.
- **Bean Validation fires at flush, not at `save`, with sequence ids** (the default); with `IDENTITY` the insert and so the check happen at `save`. Probe at the right point: an earlier draft of unit 4 was wrong because the probe entity used `IDENTITY`.
- `@NotNull`/`@Size` become `not null`/`varchar(n)`; inside an `@Embeddable` only with `@Valid` on the field, and even then `@NotNull` there stays nullable in DDL. Primitives are always `not null`, `BigDecimal` default `numeric(38,2)`.
- Missing no-arg constructor: startup and save work, reading after `clear()` throws `InstantiationException`. Embeddable class without it: `Unable to locate constructor for embeddable`. Record as `@Entity`: `persist` fails (`Can not set final ... id`).
- H2 reserved (fail as column names): year, month, day, hour, minute, second, from, to, order, group, user, value, key, end, row, limit. Allowed: name, type, date, time, number, status, level, until.
- Two `@Embedded` of the same type without renaming: `MappingException: Column 'street' is duplicated`.
- Unidirectional `@OneToMany` without `@JoinColumn` → join table `<owner table>_<field>`; with `@JoinColumn` → FK in child table. Setting only the inverse side leaves the FK `null`.
- Transient parent in `@ManyToOne` → `TransientPropertyValueException` at flush; `cascade = PERSIST` fixes it. Converter to `Character` → `char(1)` with check.

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

## Decisions taken in session 3

- JPA exercise 2 continues the Fahrradverleih (units 6–10); its public starter contains the exercise 1 solution.
- Grading tests that use committing saves (`NOT_SUPPORTED`) leave rows behind for other classes; transactional grading classes clear the tables in `@BeforeEach`.

## Content workflow (C1–C3)

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
- Students no longer need a local JDK 25: the foojay resolver downloads it (needs network on the first build).
- Branch deletion and force pushes are blocked by the permission check unless the user approves them.
