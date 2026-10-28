---
title: Konzertkasse – eine REST-API
minutes: 120
grading: teacher
classroomUrl: https://classroom50.org/SJ2627-POS-Lernwerkstatt/lernwerkstatt/assignments/rest-01-konzertkasse/accept
status: draft
rubric:
  erwartet: >-
    Alle Endpunkte und JSON-Objekte sind umgesetzt, Pfade folgen den REST-Prinzipien, Methoden und
    Statuscodes stimmen. Fehler werden als `ProblemDetail` mit eindeutiger Referenz beantwortet und
    geloggt. Der Service ist ein Stub, der im Test durch einen Mock ersetzt wird. Mappings, Statuscodes
    und Fehler sind getestet.
  genuegend: >-
    Die Endpunkte und Datenklassen sind definiert, es fehlen Details (z. B. `Location`-Header, Feldnamen
    mit Bindestrich). Tests sind nur rudimentär vorhanden.
  befriedigend: >-
    Endpunkte und Datenklassen sind vollständig, die Good Cases aller Endpunkte sind getestet.
  gut: >-
    Auch die Edge Cases sind getestet: leere Listen, Filter ohne Treffer, ungültige Referenz im Pfad.
  sehrGut: >-
    Auch die Exception Cases sind getestet: nicht gefunden, ungültige Eingaben, ausverkauft, Konzert mit
    verkauften Tickets löschen – jeweils mit Status und Fehlerreferenz.
---

Eine Konzertkasse verkauft Tickets online. Baue die REST-API für Konzerte und ihre Tickets.

Du brauchst dafür die Einheiten 1–12 im Modul REST-Controller. Die Aufgabe hat die Größe von Aufgabe 3 der Matura.

Alle Endpunkte liegen unter **`/api/concerts`**. Datenformat ist JSON. Controller und Fehlerbehandlung gehören ins Package `restfulapi.presentation`, der Service und die Datenklassen nach `restfulapi.service`.

## Schnittstellenobjekte

| Objekt | Wofür |
|---|---|
| `concertView` | ein Konzert lesen |
| `concertCreate` | ein Konzert anlegen oder ersetzen (ohne `reference`) |
| `ticketView` | ein Ticket lesen |
| `ticketOrder` | Tickets bestellen |

```json
// concertView
{
  "reference": "1198e346-551a-486a-868c-c7c17f33da38",
  "artist": "Wanda",
  "venue": "Gasometer",
  "start": "2030-05-17T20:00:00",
  "ticket-price": 4900,
  "capacity": 3000,
  "tickets-sold": 120
}
```

```json
// concertCreate
{ "artist": "Wanda", "venue": "Gasometer", "start": "2030-05-17T20:00:00", "ticket-price": 4900, "capacity": 3000 }
```

```json
// ticketView
{ "ticket-number": "T-0001", "holder": "Lena Berger", "category": "VIP" }
```

```json
// ticketOrder
{ "holder": "Lena Berger", "category": "VIP", "quantity": 2 }
```

Regeln für die Eingaben:

- `concertCreate`: `artist` und `venue` nicht leer, `start` in der Zukunft, `ticket-price` (Cent) mindestens 0, `capacity` zwischen 1 und 20000. Alle Felder sind Pflicht.
- `ticketOrder`: `holder` nicht leer, `category` ist `STANDING`, `SEATED` oder `VIP`, `quantity` zwischen 1 und 6.

`reference` ist eine UUID und wird beim Anlegen vom Service vergeben.

Eingehende Objekte sind Commands: `ConcertCreateCmd` und `TicketOrderCmd` (mit der Validierung). Was die API zurückschickt, heißt `ConcertView` und `TicketView`.

## Endpunkte

- Alle Konzerte lesen, optional gefiltert nach Künstler (`?artist=…`)
- Ein Konzert anhand seiner Referenz lesen
- Ein Konzert anlegen
- Ein Konzert ersetzen
- Ein Konzert löschen – nur, wenn noch keine Tickets verkauft sind
- Die Tickets eines Konzerts lesen
- Tickets für ein Konzert bestellen (liefert die neuen Tickets)
- Ein Ticket stornieren

Halte dich an die REST-Prinzipien: Pfade für Ressourcen und Unterressourcen, passende HTTP-Methoden, Statuscodes wie `200`, `201` mit `Location`, `204`, `400`, `404` und `409`.

## Der Service

Lege ein `ConcertService` mit `@Service` als **Stub** an: Methoden, die leere Ergebnisse liefern oder eine Exception werfen. Es meldet Fehler mit eigenen Exceptions: Konzert oder Ticket nicht gefunden, ausverkauft („requested 4 tickets, only 3 left“), Konzert hat verkaufte Tickets.

## Fehler

Wenn ein Fehler auftritt, bekommt er eine **eindeutige Referenz**. Sie steht in der Antwort (als `ProblemDetail` mit dem Feld `reference`), und die Exception wird mit dieser Referenz geloggt. Auch Fehler, mit denen niemand rechnet, werden so beantwortet – mit `500`, aber ohne Springs eigene Fehler (`400`, `404`, `405`, `415`) zu verfälschen.

## Tests

Stelle mit `@WebMvcTest` und einem Mock des Service sicher, dass alle Endpunkte funktionieren – mit Good Cases, Edge Cases und Exception Cases. Prüfe mindestens ein Schnittstellenobjekt zusätzlich mit einem `@JsonTest`.

:::pruefung
Bei jedem Push läuft `./gradlew test`. Ob deine Tests grün sind, siehst du im Repository; die Beurteilung macht deine Lehrkraft nach den Kriterien unten.
:::
