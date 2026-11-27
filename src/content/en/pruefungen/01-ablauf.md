---
title: How a mock exam works
---

The mock exams simulate the practical part of the Reife- und Diplomprüfung: real tasks, a real project, a real time limit. This plan shows you how to approach an exam – read it once and keep it next to you for every mock exam.

## The three formats

| Format | Tasks | Time | Points | Grading |
|---|---|---|---|---|
| Small mock exam | 1 × OR mapping | ~90 min | 17 | automatic, as a release in the repo |
| Medium mock exam | service + REST | ~180 min | 2 × 17 | feedback from the teacher |
| Full mock exam | 2 × OR mapping + service + REST | 300 min | 4 × 17 | feedback from the teacher |
| On-site mock exam | OR mapping + REST, one scenario | 150 min | 2 × 17 | feedback from the teacher |

The full exam matches the main exam date: **both OR mapping tasks have to be solved**, the second one brings a special feature (enum codes, embedded collections, inheritance or m:n relations with projections). The small exam follows Task 1 of the autumn exam: **one subproject `Aufgabe1_ORMapping`** with the packages `ormapping.model` and `ormapping.persistence`. The full exams have two OR mapping parts with the packages `ormapping1` and `ormapping2` – as in the main exam.

## Order and numbers

The exams are numbered and build on each other – work through them in the order of their numbers:

| Numbers | Format | Duration |
|---|---|---|
| 1 to 4 | small mock exam (JPA only) | 90 min each |
| 5 to 8 | medium mock exam (service + REST) | 180 min each |
| 9 to 12 | full mock exam (both JPA + service + REST) | 300 min each |
| 13 | on-site mock exam in the Lernwerkstatt (JPA + REST) | 150 min |

The small exams (1–4) practise exactly the one part that takes the most time in the full exams: the OR mapping. The medium ones (5–8) consist of tasks B and C – the same topics come back in the full exams in new pairs. From the medium exam on, the teacher gives feedback: look at it before you start the next exam.

## Approach within a task

:::merke
- **Read the whole task first**, especially the UML diagram: which classes? Which attributes with `{nn}`, `{uq}`, lengths? Which relations, which names (foreign keys, tables)?
- Then build calmly: entity → column constraints → relations → repository → lifecycle test.
- Every task says which units help you (e.g. units 1–10 in the JPA module).
:::

## Time plan for the full exam

A suggestion you can orient yourself by – nothing more:

| Task | Time |
|---|---|
| A1 OR mapping (regular) | 70 min |
| A2 OR mapping (with a special feature) | 80 min |
| B business service | 75 min |
| C REST API | 75 min |

:::achtung Do not leave it for the end
When the time is up at the Matura, you cannot keep working. What counts is what you have pushed by then – so push partial solutions continuously. Better to hand in all four tasks solidly started than one perfect and three empty.
:::

## Aids

As in the exam, you may use the Java cheat sheet and the grading criteria. You work in the same seed project as in the exercises (Gradle, Java 25, H2, Spring Boot); the task names the package, the class names and the subproject. Grade yourself after handing in – the four levels from Genügend to Sehr gut are on the page of every task.
