# Spec: POS Lernwerkstatt

Self-study website for the POS (Programmieren und Software-Engineering) Reife- und Diplomprüfung, school year 2026/27. Organization: https://github.com/SJ2627-POS-Lernwerkstatt · Classroom50: https://classroom50.org/SJ2627-POS-Lernwerkstatt

## Objective

Students in their final year already had a year of Matura preparation, but only in project form and without repetition. The Lernwerkstatt gives them small, repeatable knowledge pieces plus practice that mirrors the exam.

The exam (300 minutes, Java 25, Spring Boot 4) consists of tasks of three kinds, 17 points each, graded in four tiers (Genügend → Sehr gut):
1. **OR mapping**: implement a UML model as JPA entities, value objects, rich types and enums, plus repositories, queries and projections, all tested with `@DataJpaTest`.
2. **Business service**: plain Java (no DB, no Spring) data classes plus a service with business rules, proven by tests with self-built test data.
3. **REST API**: a controller with a stubbed service, tested with `@WebMvcTest`, MockMvc and `@MockitoBean`, covering good, edge and exception cases.

Users:
- **Students** (5th year, laptops, at home or at school). No account. Progress lives in their browser.
- **Teacher** (Michael). Reviews content on the live site, creates Classroom50 assignments, gives feedback on service/REST submissions.

Success looks like: a student opens the site, works through a unit in about 10 minutes (reading or listening), checks themselves, and comes back a week later for an exercise run that brings back exactly what they got wrong. Before the Matura they have written three full 300-minute mock exams in the real seed project layout.

### Assumptions (correct me if wrong)
1. Site language is German. Code, identifiers and framework terms stay English. Students are addressed with **du**.
2. The site repo is public (`SJ2627-POS-Lernwerkstatt/SJ2627-POS-Lernwerkstatt.github.io`, served at the org root). Sample solutions for exercises and mock exams live in a **private** repo (`loesungen`). The site never contains them. Autograding tests live in the Classroom50 repo (see Exercise Repos); they are readable by anyone who finds the URL, which is acceptable because tests are not solutions.
3. Answers to quiz questions ship in the static bundle. This is self-study, so a student who reads the JS only cheats themselves.
4. Theory questions (Theoriefragen) and the oral compensation exam are out of scope.
5. Mock exam and exercise sample solutions are handed out by the teacher at some point, outside the site.

## Tech Stack

| Part | Choice |
|---|---|
| Site | Svelte 5 + SvelteKit, `adapter-static`, fully prerendered, TypeScript. Same stack as parsonxam's student app |
| Content | Markdown units via `mdsvex` (frontmatter + Svelte components inside Markdown), question pools in YAML, validated with `zod` at build time |
| Code highlighting | Shiki at build time (Java, JSON, Kotlin/Gradle, SQL, HTTP) |
| PlantUML | Rendered to inline SVG **at build time** (`plantuml.jar`, Java in CI). No request to plantuml.com |
| Mermaid | `mermaid` npm package bundled and lazy-loaded on pages that contain a diagram. No CDN |
| Parsons puzzles | Template mode ported from parsonxam (`template.ts` parser, `TemplatePuzzle.svelte`, scoring) |
| Fonts | Inter + JetBrains Mono via `@fontsource-variable`, self-hosted |
| Tests | `vitest` (lib logic, content validation), `svelte-check`, one Playwright smoke test (unit page, check question, exercise run) |
| Hosting | GitHub Pages via GitHub Action on push to `main` |
| Exercises | Classroom50 assignments from template repos in the org. Gradle (Kotlin DSL) multi-project, copied from the 2026-09 Herbsttermin seed |

## Privacy (DSGVO)

- No server, no cookies, no analytics, no third-party requests (fonts, diagrams, scripts are all self-hosted or prerendered).
- Progress is stored only in `localStorage` of the student's browser.
- Progress can be exported as a JSON file and imported again (moving between school and home, handing it in voluntarily). The export may contain a name the student types in; nothing else identifies them.
- Classroom50 / GitHub is the only place with student identity, and that is the school's existing setup, not part of this site.

## Content Model

### Modules

| # | Slug | Title | Kind |
|---|---|---|---|
| 0 | `modern-java` | Moderne Java Features (var, Records, Optional, Switch, Git) | basics |
| 1 | `testing` | Unit Testing (Auffrischung) | refresher |
| 2 | `streams` | Stream API (Auffrischung) | refresher |
| 3 | `jpa` | Spring Data JPA | exam task 1 |
| 4 | `service` | Service-Schicht | exam task 2 |
| 5 | `rest` | REST-Controller | exam task 3 |
| 6 | `pruefungen` | Probeprüfungen | mock exams |

All modules are open; the start page suggests the order. Unit outline: `CURRICULUM.md`.

### Unit

One file per unit: `src/content/<module>/<nn>-<slug>.md`. `<nn>` sets the order; the unit id is `<module>/<slug>` (e.g. `jpa/enums`), so renumbering never breaks references.

```yaml
---
title: Enums richtig abbilden
minutes: 8               # estimated reading time
core: true               # false = Vertiefung (optional)
cheatsheet: 12           # page in POS_Java_CheatSheet.pdf, rendered as a link
status: draft            # draft | reviewed
---
```

Body: Markdown with
- fenced ` ```java `, ` ```plantuml `, ` ```mermaid ` blocks,
- callouts `:::merke`, `:::achtung` (typical mistake), `:::pruefung` (what the grading guideline expects for full points),
- a **Wissenscheck** at the end: all question groups tagged with this unit, shown in study mode.

A unit is one concept, 5–10 minutes, one or two code examples. Units are marked as read by the student (button at the end).

### Question pool

One file per module: `src/content/questions/<module>.yaml`. A **question group** is one main question plus 0–2 Vertiefungsfragen on the same topic.

```yaml
- id: jpa-enum-01
  unit: jpa/enums
  main:
    kind: single            # single | multi | template
    prompt: Wie speichert JPA ein Enum ohne weitere Angabe?
    options:
      - Als Name (String)
      - Als Ordinalzahl (Integer)
      - Gar nicht, es fehlt ein Mapping
    answer: 1               # index; for multi: list of indexes
    explanation: Ohne @Enumerated oder Converter wird die Ordinalzahl gespeichert ...
  followUps:
    - kind: template
      prompt: Ergänze den Converter, der Gender als Code "D"/"F"/"M" speichert.
      template: |
        @Converter({{autoApply = true}})
        public class GenderConverter implements {{AttributeConverter<Gender, String>}} {
        ...
      redHerrings: ["autoapply = true", "Converter<Gender, String>"]
      explanation: ...
```

- `template` uses parsonxam's syntax and limits (`{{…}}` pieces, `{{}}` empty gap, `~` any-order, `reusable`, `redHerrings`) and its LCS scoring. A template question counts as correct only at 100 %.
- Code in prompts and options is rendered with Shiki; options may be code snippets ("Welche Assertion schlägt fehl?").
- Build fails if an id is duplicated, a unit reference does not exist, a template does not parse, or an answer index is out of range.

Target for 2026-12-01: about 30 groups per module that is live.

### Exercise (coding, Classroom50)

`src/content/<module>/exercises/<nn>-<slug>.md` with frontmatter `title`, `classroomUrl`, `grading: auto | teacher`, `minutes`. The page shows the task (UML, JSON examples), the Classroom50 accept link and the four-tier rubric for self-assessment. The student can tick "abgegeben" (stored locally).

### Mock exam

Same as an exercise, in module `pruefungen`, with `size: small | medium | full`:
- small: 1 task, ~60–100 min
- medium: 2 tasks, ~150 min
- full: 3 tasks (JPA + service + REST), 300 min, Matura size (3 exams)

All mock exams are new (not past Matura tasks).

## Modes

### Study mode (Lernen)
Module → unit list → unit page. Reading, diagrams, cheat sheet link. A **side panel** on every page lists all modules with their units (read units ticked, the current one highlighted) and exercises. The ☰ button collapses it; the choice is kept in `localStorage` (`lernwerkstatt:sidebar`, outside the progress export). Below 960 px the panel is a drawer that closes after following a link. Wissenscheck at the end: each group is answered with **instant feedback** and explanation. Study-mode answers do not change the repetition boxes.

### Exercise mode (Üben), Führerschein style
- **Scope**: one module, or all modules.
- A **run** = 10 question groups. For each group the main question comes first; its Vertiefungsfragen unlock only if the main question was answered correctly. A wrong main question locks its follow-ups (they count as wrong).
- No feedback during the run. After the run: score and full review (your answer, correct answer, explanation) for every question.
- **Score** = correct questions ÷ all questions in the run (main + follow-ups). 100 % only if every question is correct.
- **Repetition** (Leitner boxes per group, 0 = new, 1–4):
  - group fully correct in a run → box + 1 (max 4)
  - anything wrong → box 1
  - selection for a run: box 1 first, then new groups, then boxes 2–4 by how long ago they were seen; random among equals.
- A run in progress survives a page reload.

## Progress (localStorage)

Key `lernwerkstatt:v1`:

```ts
{
  version: 1,
  name?: string,                                  // optional, only for export
  units: { [unitId]: { readAt: string } },
  groups: { [groupId]: { box: 0|1|2|3|4, lastAt: string, runs: number, wrong: number } },
  runs: { scope: string, at: string, correct: number, total: number }[],   // last 50
  currentRun?: { ... },
  exercises: { [exerciseId]: { submittedAt?: string, selfRating?: 1|2|3|4 } },
  settings: { theme?: 'light'|'dark'|'system' }
}
```

Export downloads `lernwerkstatt-fortschritt-<date>.json`; import validates with zod and replaces (after confirming). A missing or broken store starts fresh. All access is wrapped in try/catch.

## Features

- **TTS**: removed on 2026-10-24 (A9 was built, but the Web Speech API did not work reliably enough).
- **Cheat sheet**: hosted privately at `https://studious-system-8e43kky.pages.github.io/POS_Java_CheatSheet.pdf` (students are logged in to GitHub and have access). Units link to `…pdf#page=<n>`. The PDF is never copied into this repo or the site. A glossary-style "Spickzettel-Fehler" page lists `docs/cheat-sheet-errors.md`.
- **Dark mode** (system default, toggle).
- **Review support**: units with `status: draft` show an "Entwurf" badge. A hidden page `/review` lists all units, question counts and exercises with their status. Each unit has a "Fehler melden" link that opens a prefilled GitHub issue (unit id and title).
- **Start page**: modules with progress (units read, groups in box ≥ 2), "Weiter lernen" and "Üben" entry points.

## Exercise Repos (Classroom50)

- Template repos in the org: `vorlage-<module>-<nn>-<slug>`, `vorlage-pruefung-<nn>`.
- Layout copied from the 2026-09 Herbsttermin seed: Gradle Kotlin DSL, `buildSrc` conventions, subprojects `Aufgabe1_ORMapping`, `Aufgabe2_BusinessService`, `Aufgabe3_RestfulApi` (exercises keep only the relevant subproject), `readme.adoc`, `YOUR-CLASS_YOUR-NAME.txt`. Changes to the seed: Java 25 toolchain (the seed had 26), `build/` folders stay inside the project (the seed moved them to `/tmp/scratch`), no theory-question files.
- The master copy lives in the private `loesungen` repo: `seed/`, and per exercise `exercises/<id>/` with `starter/`, `solution/`, `grading/` and `mutants.json`. `scripts/assemble.py` builds the template repo content, the solution project and the Classroom50 bundle from it. Template repos are **public** (no solutions in them).
- **JPA tasks are autograded** ([Classroom50 autograding](https://github.com/foundation50/classroom50/wiki/Autograding-Basics)):
  - The task fixes package, entity, repository, query-method and projection names, so grading tests compile against the student's code.
  - Grading tests (JUnit, package `<root package>.grading`, e.g. `ormapping.grading`, so `@DataJpaTest` finds the application class) live in `CLASSROOM/autograders/ASSIGNMENT/` of the Classroom50 repo. Students cannot change them; they can read them (public Pages bundle).
  - Assignment `runtime`: `{ "java": "25" }` on `ubuntu-latest`.
  - A shared `autograder.py` replaces `Aufgabe1_ORMapping/src/test/java/ormapping/grading/` with the bundled tests, deletes old build output, runs `./gradlew :Aufgabe1_ORMapping:test --tests 'ormapping.grading.*'`, reads the JUnit XML reports and writes `result.json` with one entry per test (test name = `@DisplayName`, points from `grading/weights.json`) plus a German `release-body.md` with a hint per failed test. A compile error (also in the student's own tests) scores 0 with the first compiler errors in the release notes.
  - One grading run takes about 2.5–3 minutes (Gradle and dependencies are downloaded every time); the Classroom50 job limit is 15 minutes.
  - Students see the result as a Release with a per-test PASS/FAIL table on every submission.
- **Service and REST tasks are graded by the teacher** (feedback in the repo, e.g. a review PR). A zero-point `run` test `./gradlew test` shows whether the student's own tests pass.
- Each exercise in `loesungen` has a sample solution; CI in `loesungen` (`scripts/check.py`) checks that the solution scores full points, the template scores 0, and every mutant in `mutants.json` (the solution with one deliberate mistake) fails exactly the listed grading tests.

## Project Structure

```
SPEC.md, CURRICULUM.md
docs/                         cheat-sheet-errors.md (the PDF stays private, see Features)
src/
  content/<module>/           units (*.md), exercises/
  content/questions/          <module>.yaml
  lib/
    content/                  module list, zod schemas (shared with the browser)
    server/content/           content index: parsing, cross-checks (build time only)
    quiz/                     question kinds, scoring, run selection, Leitner
    puzzle/                   template.ts (from parsonxam), TemplatePuzzle.svelte
    progress/                 store, export/import, migration
    components/
  routes/
    +page.svelte              start
    [module]/                 module overview
    [module]/[unit]/          unit
    [module]/uebungen/[id]/   exercise / mock exam
    ueben/                    exercise mode (scope picker, run, result)
    review/
scripts/
  plantuml.ts                 build-time rendering
.github/workflows/deploy.yml
```

## Commands

```
npm run dev            # local site
npm run check          # svelte-check + content validation
npm test               # vitest
npm run build          # prerender into build/ (needs Java for PlantUML)
```

## Code Style

As in parsonxam's student app: Svelte 5 runes, logic in `lib/` as plain TS with tests, thin components and routes, `zod` at the edges (content files, imported progress). Design tokens in one `tokens.css` (copied from parsonxam), calm layout: one content column (~70ch), no animations beyond focus and state changes.

## Testing Strategy

- `vitest`: run selection, Leitner updates, scoring incl. follow-up locking, template parser (ported tests), progress migration and import validation.
- Content validation (fails `npm test` and the build): schemas, ids, unit references, template parsing, PlantUML rendering. Loading the content index throws on any problem; `content.test.ts` loads the real files.
- Playwright smoke test: open a unit, answer a Wissenscheck question, complete a run of one scope.

## Boundaries

- **Always**: no third-party requests; content validates before deploy; solutions only in the private repo.
- **Ask first**: new dependencies beyond the stack above, changing the progress format (needs a migration), publishing exercise repos.
- **Never**: analytics, tracking, server components, embedding solutions in the site.

## Milestones

| Date | Live |
|---|---|
| **2026-12-01** | Site incl. study mode, exercise mode, progress export, review page. Modules **testing** and **streams** complete. **jpa** core units 1–10 + 2 autograded exercises |
| 2026-12-15 | **jpa** complete (units 11–18, exercises 3–4), **service** module |
| 2027-01-10 | **rest** module |
| 2027-02-15 | Mock exams: 2 small, 2 medium |
| 2027-03-15 | 3 full mock exams |

## Open Questions

1. ~~Autograding spike~~ Done 2026-10-24 with `jpa-01-fahrradverleih`: Java 25 via `runtime` works (Temurin 25.0.4), a run takes ~3 minutes, per-test points and the compile-error case show up correctly in the Release.
