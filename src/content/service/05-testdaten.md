---
title: Testdaten für alle Geschäftsfälle
minutes: 10
status: draft
---

„Gut“ verlangt, dass **alle Geschäftsfälle** getestet sind. Das klappt nur mit einem Plan: Welche Fälle stecken in der Angabe?

## Fälle aus der Angabe ablesen

Geh die Regeln Satz für Satz durch und notiere für jede Grenze die Werte **knapp davor, genau darauf und knapp danach**:

| Regel | Fälle |
|---|---|
| Leihfrist 28 Tage | 28 Tage (pünktlich), 29 Tage |
| bis 2 Tage Verspätung kostenlos | 30 Tage (2 zu spät) → 0, 31 Tage (3 zu spät) → 60 Cent |
| höchstens 10 € | 78 Tage (genau 10 €), 200 Tage (gedeckelt) |
| Kinder zahlen die Hälfte | ein Kind mit Gebühr |
| Buch noch nicht zurück | offene Ausleihe, gezählt bis heute |
| nur die Ausleihen des Mitglieds | eine Ausleihe eines anderen Mitglieds in den Daten |
| Auswertung | jede Stufe belegt, eine Stufe leer, Sortierung |

Diese Tabelle ist schon die halbe Arbeit. Jede Zeile wird ein Test – oder eine Zeile in einem parametrisierten Test.

## Randwerte parametrisiert

```java
@ParameterizedTest(name = "{0} Tage → {1} Cent")
@CsvSource({
        "0, 0",
        "28, 0",      // letzter Tag der Leihfrist
        "30, 0",      // 2 Tage zu spät: kostenlos
        "31, 60",     // 3 Tage zu spät: alle 3 Tage zählen
        "78, 1000",   // genau das Maximum
        "200, 1000"   // gedeckelt
})
void verify_fee_for_returned_loan(int days, int cents) {
    assertThat(LateFeeService.fee(returnedAfter(ANNA, days), TODAY)).isEqualTo(cents);
}
```

Der `name` macht die Ausgabe lesbar: `31 Tage → 60 Cent`. Die Kommentare dokumentieren, **welche Regel** eine Zeile prüft.

## Testdaten bauen, ohne sich zu wiederholen

```java
private static final LocalDate START = LocalDate.of(2026, 3, 2);
private static final LocalDate TODAY = START.plusYears(1);
private static final Member ANNA = new Member("Anna", MemberType.ADULT);
private static final Member BEN = new Member("Ben", MemberType.CHILD);
private static final Book MALINA = new Book("9783518365000", "Malina");

/** Eine Ausleihe, die nach der angegebenen Zahl von Tagen zurückkam. */
private static Loan returnedAfter(Member member, int days) {
    return new Loan(member, MALINA, START, START.plusDays(days));
}
```

- Konstanten für Objekte, die in vielen Tests vorkommen.
- Eine **Fabrikmethode** pro Art von Testdatum. Der Test zeigt nur, was für ihn wichtig ist: `returnedAfter(ANNA, 31)`.
- Ein festes Datum (`START`), nie `LocalDate.now()` – sonst ändert sich das Ergebnis jeden Tag.

## Ein Test für das Zusammenspiel

Neben den Regeln brauchst du mindestens einen Test, der die **Hauptmethode** mit gemischten Daten aufruft:

```java
@Test
void verify_fee_for_member_sums_only_their_loans() {
    LateFeeService service = new LateFeeService(List.of(
            returnedAfter(ANNA, 31), returnedAfter(ANNA, 40), returnedAfter(CARLA, 78)));

    assertThat(service.feeFor(ANNA, TODAY)).isEqualTo(300);
}
```

Carlas Ausleihe gehört absichtlich dazu: Ohne sie würde auch ein Service ohne Filter 300 liefern.

:::pruefung
Schreib die Fall-Tabelle als Kommentar über die Testklasse oder als Namen der Testmethoden. Wer deine Abgabe liest, sieht dann sofort, dass jeder Geschäftsfall abgedeckt ist.
:::

:::merke
- Fälle aus der Angabe ablesen: jede Grenze davor, darauf, danach.
- Randwerte mit `@ParameterizedTest` und `@CsvSource`.
- Fabrikmethoden und Konstanten für Testdaten, festes Datum statt `now()`.
- Testdaten so wählen, dass ein falsches Service den Test nicht besteht.
:::
