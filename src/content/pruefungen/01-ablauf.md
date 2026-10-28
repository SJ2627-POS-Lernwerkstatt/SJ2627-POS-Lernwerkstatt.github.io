---
title: So läuft eine Probeprüfung
minutes: 6
status: draft
---

Die Probeprüfungen simulieren den praktischen Teil der Reife- und Diplomprüfung: echte Aufgaben,
echtes Projekt, echtes Zeitlimit. Dieser Plan zeigt dir, wie du eine Prüfung angehst – am besten liest du
ihn einmal durch und legst ihn bei jeder Probeprüfung neben dich.

## Die drei Formate

| Format | Aufgaben | Zeit | Punkte | Bewertung |
|---|---|---|---|---|
| Kleine Probeprüfung | 1 × OR-Mapping | ~90 min | 17 | automatisch, per Release im Repo |
| Mittlere Probeprüfung | Service + REST | ~180 min | 2 × 17 | Feedback der Lehrkraft |
| Volle Probeprüfung | 2 × OR-Mapping + Service + REST | 300 min | 4 × 17 | Feedback der Lehrkraft |

Die volle Prüfung entspricht dem Haupttermin: **beide OR-Mapping-Aufgaben sind zu lösen**,
die zweite bringt eine Besonderheit mit (Enum-Codes, eingebettete Sammlungen, Vererbung oder
m:n-Beziehungen mit Projektionen). Die kleine Prüfung hält sich an Aufgabe 1 des Herbsttermins:
**ein Subprojekt `Aufgabe1_ORMapping`** mit den Packages `ormapping.model` und
`ormapping.persistence`. Die vollen Prüfungen haben zwei OR-Mapping-Teile mit den Packages
`ormapping1` und `ormapping2` – wie im Haupttermin.

## Reihenfolge und Nummern

Die Prüfungen sind durchnummeriert und bauen aufeinander auf – arbeite sie in der Reihenfolge
der Nummern durch:

| Nummern | Format | Dauer |
|---|---|---|
| 1 bis 4 | Kleine Probeprüfung (nur JPA) | je 90 min |
| 5 bis 8 | Mittlere Probeprüfung (Service + REST) | je 180 min |
| 9 bis 12 | Volle Probeprüfung (beide JPA + Service + REST) | je 300 min |

Die kleinen Prüfungen (1–4) üben genau den einen Teil, der bei den vollen Prüfungen am meisten
Zeit kostet: das OR-Mapping. Die mittleren (5–8) bestehen aus den Aufgaben B und C – dieselben Themen kommen in den vollen
Prüfungen in neuer Paarung wieder. Ab der mittleren Prüfung gibt die Lehrkraft Feedback: Sieh es
dir an, bevor du die nächste Prüfung beginnst.

## Vorgehen in einer Aufgabe

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
Nach Ende der Zeit kannst du bei der Matura nicht weiterarbeiten. Es zählt, was du bis dahin
gepusht hast – push deshalb laufend Teillösungen. Lieber alle vier Aufgaben solide angefangen
abgeben als eine perfekt und drei leer.
:::

## Hilfsmittel

Wie bei der Prüfung darfst du den Java-Spickzettel und die Beurteilungskriterien benutzen.
Gearbeitet wird im selben Seed-Projekt wie in den Übungen (Gradle, Java 25, H2, Spring Boot);
die Angabe nennt Package, Klassennamen und Subprojekt. Bewerte dich nach der Abgabe selbst –
die vier Stufen von Genügend bis Sehr gut stehen auf der Seite jeder Aufgabe.
