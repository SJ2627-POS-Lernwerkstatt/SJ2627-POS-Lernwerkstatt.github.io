# Plan: Release 1 (2026-12-01)

Scope (SPEC → Milestones): site with study mode, exercise mode, progress export, review page; modules **testing** and **streams** complete; **jpa** units 1–10 with 2 autograded exercises.

Current state and next steps: `tasks/status.md`.

Order: platform first (weeks 1–2), content in parallel from week 2 so you can review on the live site early. Each task is one branch and ends with `npm run check && npm test && npm run build` green.

## Phase A: Platform (Oct 26 – Nov 8)

| # | Task | Done when |
|---|---|---|
| A1 ✓ | Scaffold SvelteKit + adapter-static + mdsvex, tokens.css and fonts from parsonxam, Pages deploy workflow | Empty start page is live at `sj2627-pos-lernwerkstatt.github.io` |
| A2 ✓ | Content loading: zod schemas for unit frontmatter, question groups, exercises; validation runs in `npm test` and the build | A broken frontmatter or duplicate id fails CI |
| A3 ✓ | Unit page: Markdown, Shiki, callouts, cheat sheet link, "Entwurf" badge, "Fehler melden" link, mark as read | Sample unit renders with all elements |
| A4 ✓ | Diagrams: PlantUML at build time (SVG inline, dark-mode friendly), Mermaid lazy-loaded | A unit with both diagram types renders without network requests to third parties |
| A5 ✓ | Progress store: localStorage with try/catch, versioning, export/import file | Unit tests for migration, import validation, broken store |
| A6 ✓ | Question components: single, multi, template (port parsonxam `template.ts` + tests + `TemplatePuzzle.svelte`) | All three kinds answerable with keyboard and mouse |
| A7 ✓ | Study mode Wissenscheck: groups for a unit, instant feedback, explanation | Answer shown after each question |
| A8 ✓ | Exercise mode: scope picker, run selection (Leitner), main/follow-up locking, no feedback during the run, result and review, run survives reload | Unit tests for selection, scoring, locking, box updates |
| A9 ✗ | TTS (built, then removed on 2026-10-24 at the user's request) | — |
| A10 ✓ | Start page and module overviews with progress; `/review` page; dark mode toggle | Review page lists every unit with status and question count |
| A11 ✓ | Exercise page (task, Classroom50 link, rubric, "abgegeben") | Sample exercise renders |
| A12 ✓ | Playwright smoke test in CI | Green on main |

## Phase B: Autograding (Nov 2 – Nov 15, parallel)

| # | Task | Done when |
|---|---|---|
| B1 ✓ | Gradle seed for exercises from the 2026-09 Herbsttermin layout, reduced to one subproject | `./gradlew test` green on a fresh clone |
| B2 ✓ | Spike: Classroom50 assignment with `runtime.java = 25`, `autograder.py` copying grading tests and converting JUnit XML to `result.json` | A test assignment in the org shows per-test points in the Release |
| B3 ✓ | Private `loesungen` repo with CI running grading tests against sample solutions | CI green |

## Phase C: Content (Nov 9 – Nov 29)

Every unit follows the same pattern: draft → deploy → your review on the site → `status: reviewed`.

| # | Task | Size |
|---|---|---|
| C1 ✓ | Module testing: units 1–12 + V 13–15, ~30 question groups | 15 units |
| C2 ✓ | Module streams: units 1–9 + V 10, ~30 question groups | 10 units |
| C3 ✓ | Module jpa: units 1–10, ~25 question groups | 10 units |
| C4 ✓ | JPA exercises 1–2 (task, starter template, grading tests, sample solution) | 2 exercises |
| C5 ✓ | Module modern-java: units 1–5 (var, records, optional, switch, git), 14 question groups; streams cross-links; from lecture 3xHIF 01 | 5 units |
| C6 ✓ | Re-check all `cheatsheet` page references against the updated POS_Java_CheatSheet.pdf (22 pages, built 2026-10-27) | 69 units |

## Phase D: Release (Nov 30 – Dec 1)

- D1 Fix review findings, check all drafts you have reviewed are marked `reviewed`.
- D2 Create Classroom50 assignments for the 2 JPA exercises and insert the links.
- D3 Short "So funktioniert die Lernwerkstatt" page (modes, export, privacy note).

## Phase E: Probeprüfungen (Dec 2026 – Mar 2027; milestones 2027-02-15 and 2027-03-15)

Mock exams in module `pruefungen`: 4 small (JPA only, autograded, 17 P), 4 medium (Service + REST,
teacher-graded, 2×17 P), 4 full (A1 regular + A2 with a twist – both mandatory – plus B and C,
4×17 P = 68, 300 min, teacher-graded; all A tasks new, pool of 20 tasks). One page per exam,
tasks in the body. Descriptions: `~/.opencode/plan/probepruefungen.md`.

| # | Task | Done when |
|---|---|---|
| E1 ✓ | Multi-task exam page pattern: `01-ablauf` unit, draft pages for pp-a-01 (1 task) and full-01 (4 tasks), smoke test covers an exam page | Both pages render on the live site, kicker shows the exam size |
| E2 ✓ | pp-a-01 Immobilienmakler, pp-a-02 Tierheim (enum codes + ElementCollection), pp-a-03 Sportverein (m:n), pp-a-04 Weingut (JPQL + projections): Angabe + UML, starter (assemble.py), solution, 15–20 grading tests + mutants each, CI green, published, pages | `./gradlew test` green on starters; check.py: solution full points, vorlage 0, mutants fail listed tests |
| E3 | pp-bc-01..04 (Parkhaus+Projekt-Tasks, Versandkosten+Produktkatalog, Energie+Sensoren, Bonus+Feriencamp-Anmeldungen): B/C Angaben, starters, sample tests, publish.sh, pages | all four live as draft, accept links work |
| E4 | Seed gains `Aufgabe2_ORMapping` (packages `ormapping1`/`ormapping2` like the Haupttermin seed); pp-full-01..04 with 8 new A tasks (A1: Autowerkstatt, Pension Seeblick, Coworking-Space, Bäckereikette; A2: Fahrschule enum-codes, Bootshafen ElementCollection+OneToOne, Arztpraxis inheritance, Messe m:n+projections), each Angabe + UML + solution; B and C reuse the pool tasks in new combinations; pages + publish | full templates clone and build; all four pages live |
| E5 | Teacher review on the site → `status: reviewed`; update SPEC.md milestones (4/4/4 instead of 2/2/3) | no `draft` left in pruefungen |

## Risks

- **Review bottleneck**: ~35 units + ~85 question groups in three weeks. Mitigation: content starts in week 2, in small batches (one module section at a time).
- **Gradle in autograding**: wrapper download and dependency resolution on every run may be slow. Mitigation: checked in B2; fallback is a custom container image with dependencies preloaded.
