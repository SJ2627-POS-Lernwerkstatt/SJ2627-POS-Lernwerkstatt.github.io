---
title: Fahrradverleih-API – Seiten und Links
minutes: 120
grading: teacher
classroomUrl: https://classroom50.org/SJ2627-POS-Lernwerkstatt/lernwerkstatt/assignments/rest-02-fahrradverleih-api/accept
status: draft
rubric:
  erwartet: >-
    Alle Endpunkte liefern HAL mit den geforderten Links. Listen von Fahrrädern sind seitenweise
    abrufbar, mit Default-Werten, Sortierung und Links auf die Nachbarseiten. Ausleihen werden mit
    `201` und `Location` angelegt, Fehler mit dem passenden Status beantwortet. Die Tests prüfen Links,
    Seitenangaben und die an den Service übergebenen `Pageable`s.
  genuegend: >-
    Die Endpunkte liefern die Daten, aber Links oder Pagination fehlen weitgehend. Tests sind nur
    rudimentär vorhanden.
  befriedigend: >-
    Endpunkte, Links und Pagination sind umgesetzt; die Good Cases sind getestet.
  gut: >-
    Auch die Edge Cases sind getestet: leere Seite, letzte Seite ohne `next`, Fahrrad ohne Station,
    Defaults und Sortierung.
  sehrGut: >-
    Auch die Exception Cases sind getestet: unbekanntes Fahrrad, unbekannte Station, ungültige
    E-Mail, Fahrrad schon ausgeliehen, unbekannte Ausleihe.
---

Der Fahrradverleih aus dem JPA-Modul bekommt eine REST-API. Sie liefert Fahrräder und Stationen **seitenweise** und mit **Links** (HATEOAS), damit ein Client sich durch die API bewegen kann, ohne Pfade selbst zusammenzubauen.

Du brauchst dafür das ganze Modul REST-Controller, vor allem die Einheiten 12–14.

Controller und Fehlerbehandlung gehören ins Package `restfulapi.presentation`, der Service und die Datenklassen nach `restfulapi.service`.

## Schnittstellenobjekte

```json
// bike
{ "inventory-number": "CITY0001", "model": "Citybike 3", "type": "CITY", "electric": false, "station-id": 4 }
```

`station-id` ist `null`, wenn das Fahrrad gerade unterwegs ist.

```json
// station
{ "id": 4, "name": "Westbahnhof", "capacity": 24, "available": 7 }
```

```json
// rental
{ "id": 17, "customer": "lena@example.com", "rented-at": "2026-11-02T08:00:00", "returned-at": null }
```

```json
// rentalCreate
{ "customer": "lena@example.com" }
```

`customer` muss eine gültige E-Mail-Adresse sein.

Das eingehende Objekt ist ein Command: `RentalCreateCmd`. Was die API zurückschickt, heißt `BikeView`, `StationView` und `RentalView`.

## Endpunkte

| | Pfad | Antwort |
|---|---|---|
| Fahrräder seitenweise | `GET /api/bikes?page=…&size=…&sort=…` | HAL-Seite, Default: 10 pro Seite, sortiert nach Inventarnummer |
| ein Fahrrad | `GET /api/bikes/{inventoryNumber}` | Fahrrad mit Links |
| Ausleihen eines Fahrrads | `GET /api/bikes/{inventoryNumber}/rentals` | Liste mit Links `self` und `bike` |
| eine Ausleihe | `GET /api/bikes/{inventoryNumber}/rentals/{rentalId}` | |
| ausleihen | `POST /api/bikes/{inventoryNumber}/rentals` | `201` mit `Location` auf die neue Ausleihe |
| Stationen | `GET /api/stations` | Liste, jede Station mit Links |
| eine Station | `GET /api/stations/{id}` | Station mit Links |
| Fahrräder einer Station | `GET /api/stations/{id}/bikes?page=…&size=…` | HAL-Seite |

## Links

- Jedes Fahrrad hat die Links `self`, `rentals` und – wenn es an einer Station steht – `station`.
- Jede Station hat die Links `self` und `bikes`.
- Seiten haben die Links `self`, `first`, `last` und, wo es sie gibt, `prev` und `next`, dazu die Angabe `page` mit `size`, `number`, `totalElements` und `totalPages`.
- In HAL heißen die Listen `bikes` und `stations` (nicht `bikeViewList`).

## Der Service

Ein `BikeService` mit `@Service` als Stub. Seiten liefert er als `Page<…>`. Fehler meldet er mit eigenen Exceptions: Fahrrad, Station oder Ausleihe nicht gefunden (`404`), Fahrrad schon ausgeliehen (`409`).

## Tests

Teste mit `@WebMvcTest` und einem Mock des Service. Prüfe neben Status und Feldern auch die Links (`$._links…`) und dass `page`, `size` und `sort` richtig als `Pageable` beim Service ankommen.

:::pruefung
Bei jedem Push läuft `./gradlew test`. Ob deine Tests grün sind, siehst du im Repository; die Beurteilung macht deine Lehrkraft nach den Kriterien unten.
:::
