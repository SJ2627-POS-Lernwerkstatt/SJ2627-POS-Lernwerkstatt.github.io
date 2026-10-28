# Status

Last updated: 2026-10-28 (exams 1–8 published); before: 2026-10-27 (session 6: module **modern-java** added as module 0 – var, Records, Optional, Switch-Ausdrücke, Git-Begriffe; cheat sheet page references re-checked against the updated 22-page PDF; Phase E started: E1 pruefungen skeleton). Live: https://sj2627-pos-lernwerkstatt.github.io

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
| C5 | Module **modern-java** (Grundlagen, first in course order): 5 units from lecture 3xHIF `01_Var_Records_Optional_Switch` – var (LVTI, Grenzen, Collections), Records (generierte Members, kompakter Konstruktor, Record vs. Klasse, `instanceof`-Muster), Switch-Ausdrücke (Pfeil, `yield`, Vollständigkeit, Pattern Matching an sealed), Optional (Erzeugen, orElse/orElseGet/orElseThrow, Best Practices) and Git-Begriffe (drei Orte, Branch/Merge/Konflikt, push/pull, Classroom50-Ablauf, mermaid-Commit-Graph). 14 question groups, all examples run on Temurin 27 (incl. negative compiles: `var` field/null, uncoverable switch). Streams module stays as the refresher; cross-links between `modern-java/records`↔`streams/datenklassen`, `modern-java/optional`↔`streams/finden`+`streams/zahlen`, `modern-java/records`→`jpa/konstruktoren`, `modern-java/optional`→`jpa/repositories`. Wiring: `MODULES`/`MODULE_SLUGS`; unit/exercise/pool path regexes in `build.ts` + unit-id regex in `schema.ts` now allow hyphens in module slugs |
| C6 | All `cheatsheet` page references (64 existing + 5 new units) checked against the updated POS_Java_CheatSheet.pdf (22 pages, local build `POS_cheatsheets/build/docs/asciidoc/pdf/`): every reference matches the new pagination — no corrections needed. Re-check against the hosted PDF after its PR merge. Optional and Git have no sheet section yet (candidate for `_Language_CheatSheet.adoc` in a future PR — would shift pages again) |
| — | `vorlage-jpa-01-fahrradverleih` updated with the H2 pin |
| — | JPA units 2–4, 6–10: UML diagrams in exam notation; unit 3: Lombok section (verified: both constructor annotations on a class without own fields fail with "Konstruktor X() ist bereits … definiert"; `@AllArgsConstructor` takes only own fields incl. lists; `@Data` replaces AbstractPersistable's equals and warns). Lombok needs `compileOnly`/`annotationProcessor("org.projectlombok:lombok")`, not in the seed |
| D2 | Classroom50 accept links in `classroomUrl` of both JPA exercises (`…/lernwerkstatt/assignments/<slug>/accept`) |
| — | CI: actions on current majors (checkout 7, setup-node 7, setup-java 6, cache 6, upload-artifact 7, upload-pages-artifact 5, deploy-pages 5), also in `loesungen` |
| — | Seed: foojay resolver 1.0.0 in `settings.gradle.kts` and `buildSrc/settings.gradle.kts` (there without version, it is already on the classpath). Verified with an empty Gradle home and `auto-detect=false`: Temurin 25 is downloaded, exercise 2 tests pass. Both template repos updated |
| — | Vertiefung units dropped (testing 13–15, streams 10 and their 8 question groups); curriculum lists core units only. Site code for `core: false` stays, unused |
| — | JPA units 11–18 (ManyToMany, OneToOne, ElementCollection, Vererbung, Objektgraphen testen, abgeleitete Queries, JPQL, Projektionen), 16 question groups, all examples run in a scratch project |
| — | JPA exercise 3 `jpa-03-paketdienst` (units 2–10, empty starter): two embedded addresses with `@EmbeddedColumnNaming`, `ServiceLevel` codes, `TrackingNumber` (`RR123456789AT`), composition Shipment–Parcel with orphanRemoval. 22 tests, 28 points, 16 mutants |
| — | JPA exercise 4 `jpa-04-fachtagung` (full Aufgabe 1, modelled on PLÜ 2025-12-03): Person + abstract PersonRole → Speaker/Attendee, ConferenceEvent (format codes, embedded Room, speakers m:n), TimeSlot composition (`day`/`from`/`to` → renamed columns) with attendees m:n, 4 queries incl. projection and distinct count. 25 tests, 39 points, 22 mutants; grading independent of the inheritance strategy |
| D3 | `/so-funktionierts` (Markdown route with a prose layout): modules, units, Üben with boxes, Classroom50 exercises, progress export, privacy. Linked from the footer and the start page |
| — | Module **service**: 10 units (Aufgabe 2 overview, Angabe → Code, Regeln, Ergebnisse zusammenfassen, Testdaten, Fehlerfälle, Datenzugriff Stub/Mock, aufteilen, Spring-Service, Spring-Services testen), 20 question groups. Running example: library late fees. All code run in a copy of the seed's `Aufgabe2_BusinessService` |
| — | Service exercises (teacher-graded, `loesungen/exercises/service-0N-…`, empty starter): Ladestationen (data passed in; 25 sample tests), Sportabzeichen (repository interface + `Map<Badge, List<…>>`; 20), Kinoreservierung (Spring `@Service`, DTOs, 4 exceptions, in-memory `@Repository`s; 16). Published (templates `vorlage-service-0N-…`, zero-point run test `./gradlew test`, linked from the site) |
| — | `loesungen/scripts/publish.sh <id> "<title>" "<description>"`: template repo + `gh teacher assignment add` (Java 25) + for teacher-graded exercises a zero-point run test `./gradlew test` |
| — | Module **rest**: 15 units (Grundlagen, `@RestController`, Parameter, Anlegen, Ändern/Löschen, Validierung, Fehlerbehandlung mit `ResponseEntityExceptionHandler`, JSON/Jackson 3, `@WebMvcTest`, MockMvc, Teststrategie, Unterressourcen, HATEOAS, Pagination, `@JsonTest`), 18 question groups. HATEOAS, pagination and `@JsonTest` are core units again (user: needed for good grades) |
| — | REST exercises (teacher-graded, `loesungen/exercises/rest-0N-…`): Konzertkasse (CRUD, tickets sub-resource, error reference; 24 sample tests), Fahrradverleih-API (pagination + HATEOAS; 15), Kursbuchung (nested validation, PATCH, 409s, `@JsonTest` against a file; 20). All six service/REST exercises published with `scripts/publish.sh` and linked |
| — | Collapsible side panel with the course structure (`CourseNav.svelte`, `lib/sidebar.ts`, root `+layout.server.ts`); state applied before first paint in `app.html`; smoke test added |
| E2 | **Site:** 13 Prüfungsseiten `src/content/pruefungen/exercises/` – 1–4 small (vollständige Angaben mit UML, alle Namen wie die Bewertungstests sie erzwingen), 5–9 medium (Rahmen: B+C-Paarungen aus dem Pool, je 2×17 P, 180 min; 09 = Theater+Ticketshop neu), 10–13 full (A1+A2 mit Angabe-Skizzen, 4×17 P, 300 min; 10 = Autowerkstatt und Fahrschule ausführlich). Nummern in den Titeln, Reihenfolge in `01-ablauf`. **loesungen:** pp-a-01..04 complete – solution, 14/12/12/12 grading tests à 17 P, weights, 9/7/7/6 mutants, starters, `check.py` green on all four (solution 17/17, vorlage 0, every mutant fails exactly the listed tests). **Published 2026-10-28:** bundles in `classroom50/lernwerkstatt/autograders/pp-a-0N-…`, public templates `vorlage-pp-a-0N-…`, assignments registered (Java 25), accept links in `classroomUrl` of pages 1–4. Not spiked with a real student repo yet |
| E3 | **Medium exams 5–8** (teacher-graded, `loesungen/exercises/pp-bc-0N-…`, both subprojects): 5 Parkhaus (30-min blocks, day/night rate, 24 h cap, subscribers; `revenuePerDay` TreeMap) + Projekt-Tasks (CRUD, sub-resource, PATCH status, 409s; 43 sample tests); 6 Versandkosten (zone × weight table, bulky, free shipping, `OrderRepository` mock, `EnumMap` summary) + Produktkatalog (PagedModel, HAL links self/category/products, create under category; 34); 7 Energie-Abrechnung (`@Service`, two repositories + in-memory `@Repository`s, DTOs, started months, credit cap, ArgumentCaptor) + Sensorwerte (optional range ≤ 31 days, `count` 1–100 via built-in method validation – no `@Validated`, 204 statistics; 37); 8 Bonusprogramm (`BonusCalculator` + `TierService` with mocked calculator) + **Feriencamp-Anmeldungen** (renamed from Kurs-Anmeldungen: too close to rest-03 Kursbuchung; nested `@Valid` child/guardian, PATCH partial, 4× 409, `@JsonTest` against `registration.json`; 40). Exam 9 (Theater + Ticketshop) dropped, full exams renumbered 9–12. **Published 2026-10-28** (templates `vorlage-pp-bc-0N-…`, assignments with 0-point run test, accept links on pages 5–8). Not spiked with a real student repo yet |
| E1 | Module **pruefungen** skeleton: unit `01-ablauf` (format table, time plan, reading order, push-partial-solutions warning); two draft exam pages following the existing exercise layout (one page, tasks in body): `uebungen/immobilienmakler.md` (size small, grading auto, PlantUML class sketch, 5-stage rubric) and `uebungen/autowerkstatt-und-fahrschule.md` (size full, 300 min, 4×17 P, tasks A1 Autowerkstatt, A2 Fahrschule enum-codes, B Parkhaus, C Produktkatalog, time plan table). Smoke test extended (mock exam pages + `figure.diagram-plantuml img` — PlantUML embeds as base64 data URI, not inline `<svg>`) |

Content so far: modern-java 5 units, testing 12, streams 9, jpa 18, service 10, rest 15 (146 question groups); JPA exercises 1–4 (all four linked from the site; templates `vorlage-jpa-0N-…`, assignments registered with Java 25); pruefungen: 1 unit + 12 exam pages (1–4 published, 5–8 complete, 9–12 frames), no question groups. All content `draft`.

## Next

1. Review the `modern-java` units on the live site → `status: reviewed` (D1).
2. Re-check the `cheatsheet` page numbers against the hosted PDF once the cheat sheet PR is merged and deployed (local build says current refs match; Optional/Git still have no sheet section).
3. Optionally spike JPA exercises 2–4 and one service/REST exercise with a real student repo, as in B2.
4. Phase D1 after the review.
5. Phase E – Probeprüfungen: E1–E3 done (exams 1–8 published; exam 9 Theater dropped, full exams
   renumbered 9–12). Next E4 (Seed 2× ORM, full exams), E5 (review).
6. Language pass on modern-java and pruefungen done (2026-10-28). Conventions: „der Service“ (course-wide, 95 places changed), English identifiers in all exams (10–13 renamed), exam tasks labelled A1/A2/B/C (medium exams B/C), quotes „…“.

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

- REST: a `@ExceptionHandler(Exception.class)` without `extends ResponseEntityExceptionHandler` turns Spring's own 400/404/405/415 into 500 (the PLÜ II reference solution has this). `spring.mvc.problemdetails.enabled` registers its own handler that wins over yours ("Invalid request content."). `linkTo(methodOn(C.class).m())` fails with "Could not generate CGLIB subclass" when `m` returns a record — return `ResponseEntity`/`EntityModel`. Returning `Page` logs "Serializing PageImpl instances as-is is not supported"; use Spring Data's `PagedModel` or `PagedResourcesAssembler`. Jackson 3: a missing primitive field is a 400 (`FAIL_ON_NULL_FOR_PRIMITIVES`), unknown fields are ignored, `ObjectMapper` is `tools.jackson.databind`. `@MockBean` is gone, use `@MockitoBean`.
- `scripts/publish.sh`: bash takes „“ after `$var` as part of the name — write `${var}`.

- Service module: a `@Service` whose constructor needs an interface without a bean breaks the seed's `contextLoads` ("required a bean of type … that could not be found"). `@InjectMocks` takes the constructor with the most parameters and passes `null` for anything without `@Mock`/`@Spy`. `spring-tx` (`@Transactional`) is not on the `Aufgabe2_BusinessService` classpath. `Comparator.comparingInt(f -> f.x()).reversed()` does not compile (lambda type is `Object`).

- Grading tests: in a transactional test class, a save rejected at flush stays in the persistence context, so every later `saveAndFlush` in the same test is rejected too. Put several `assertRejected` checks in a `NOT_SUPPORTED` class. `firstValue` (own JDBC connection) cannot see uncommitted data; in transactional classes use a native query through the `TestEntityManager`.
- `cascade = PERSIST` to an already saved (detached) entity fails with `Detached entity passed to persist` outside a shared transaction.
- JPA facts from session 5: `@Column(nullable = false)` in a SINGLE_TABLE subclass breaks saving the other subclasses; `@NotNull` there adds no DDL. Bidirectional ManyToMany default join table `books_authors(books_id, authors_id)`. ElementCollection/ManyToMany `List` removal rewrites all rows. Spring Data fills a record from a derived query (`branchName` → `branch.name`) and adds `new …` to a `@Query` returning a record. `+` does not concatenate strings in HQL. `sum(int)` → Long, `avg` → Double, `sum` over no rows → null.

- SvelteKit 3: `$app/env` (not `$app/environment`); config lives in `vite.config.ts`; `#lib/*` imports need a `.js` extension, files under `scripts/` are imported with `.ts`.
- `vite preview` caches the file list at start: restart it after every `npm run build`.
- Local dev needs `plantuml` on the PATH (Homebrew) or `PLANTUML_JAR`.
- Progress store loads in the root layout's `onMount`, so prerendered markup hydrates with empty progress first. Never mutate `$state` during render (create run answers when navigating, see `prepare()` in the run page).
- The Playwright smoke test uses real content (first group of `testing/aufbau` is a single question with a follow-up; `jpa/uebungen/fahrradverleih` exists; the mock exam test needs `pruefungen/uebungen/autowerkstatt-und-fahrschule` and `pruefungen/uebungen/immobilienmakler` incl. its PlantUML diagram). Adjust `e2e/smoke.test.ts` if that content changes.
- Radios inside a card label need `aria-labelledby` on the tier name, otherwise their accessible name is the whole card.
- Grading tests run with `@Transactional(propagation = NOT_SUPPORTED)` and `deleteAll()` in `@BeforeEach`: each save is its own transaction, so a rejected save does not break the next check.
- Classroom50: `gh teacher` needs scopes `admin:org` etc. (`gh teacher login`, interactive). Student repos must stay private, public ones are not autograded.
- Students no longer need a local JDK 25: the foojay resolver downloads it (needs network on the first build).
- Branch deletion and force pushes are blocked by the permission check unless the user approves them.
