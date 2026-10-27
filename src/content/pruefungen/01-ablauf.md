---
title: So läuft eine Probeprüfung
minutes: 6
status: draft
---

Die Probeprüfungen simulieren den praktischen Teil der Reife- und Diplomprüfung: echte Aufgaben,
echtes Projekt, echte Zeit. Dieser Plan zeigt dir, wie du eine Prüfung angehst – am besten liest du
ihn einmal durch und legst ihn bei jeder Probeprüfung neben dich.

## Die drei Formate

| Format | Aufgaben | Zeit | Punkte | Bewertung |
|---|---|---|---|---|
| Kleine Probeprüfung | 1 × OR-Mapping | ~90 min | 17 | automatisch, per Release im Repo |
| Mittlere Probeprüfung | Service + REST | ~180 min | 2 × 17 | Feedback der Lehrkraft |
| Volle Probeprüfung | 2 × OR-Mapping + Service + REST | 300 min | 4 × 17 | Feedback der Lehrkraft |

Die volle Prüfung entspricht dem Haupttermin: **beide OR-Mapping-Aufgaben sind zu lösen**,
die zweite bringt eine Besonderheit mit (Enum-Codes, eingebettete Sammlungen, Vererbung oder
viele-zu-viele mit Projektionen).

## Reihenfolge in der Aufgabe

:::merke
- **Erst die Angabe komplett lesen**, besonders das UML-Diagramm: Welche Klassen? Welche Attribute
  mit `{nn}`, `{uq}`, Längen? Welche Beziehungen, welche Namen (Foreign Keys, Tabellen)?
- Dann in Ruhe bauen: Entity → Spalten-Constraints → Beziehungen → Repository → Lifecycle-Test.
- Bei jeder Aufgabe steht, welche Einheiten dir helfen (z. B. Einheiten 1–10 im JPA-Modul).
:::

## Zeitplan bei der vollen Prüfung

Ein Vorschlag, an dem du dich orientieren kannst – nicht mehr:

| Aufgabe | Zeit |
|---|---|
| A1 OR-Mapping (regulär) | 70 min |
| A2 OR-Mapping (mit Besonderheit) | 80 min |
| B Business-Service | 75 min |
| C REST-API | 75 min |

:::achtung Nicht zum Schluss aufheben
Bei der Matura ist die Zeit hart zu Ende. Push von Teillösungen zählt – lieber alle vier Aufgaben
mit sicherem Code abgeben als eine perfekt und drei leer.
:::

## Hilfsmittel

Wie bei der Prüfung darfst du den Java-Spickzettel und die Beurteilungskriterien benutzen.
Arbeitsumgebung ist dasselbe Seed-Projekt wie in den Übungen (Gradle, Java 25, H2, Spring Boot);
die Angabe nennt Package, Klassennamen und Subprojekt. Bewerte dich nach der Abgabe selbst –
die vier Stufen von Genügend bis Sehr gut stehen auf der Seite jeder Aufgabe.
