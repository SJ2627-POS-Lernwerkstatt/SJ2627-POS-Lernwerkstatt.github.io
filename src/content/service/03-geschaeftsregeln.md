---
title: Geschäftsregeln als eigene Methoden
minutes: 10
status: draft
---

Jede Regel aus der Angabe bekommt eine eigene, kleine Methode. So kannst du jede Regel für sich testen, und die Hauptmethode liest sich wie die Angabe.

## Die Regeln der Bücherei

```java
static final int LOAN_DAYS = 28;
static final int GRACE_DAYS = 2;
static final int CENTS_PER_DAY = 20;
static final int MAX_CENTS_PER_LOAN = 1000;

/** Tage nach der Leihfrist; ein Buch, das noch fehlt, zählt bis heute. */
static long daysLate(Loan loan, LocalDate today) {
    LocalDate end = loan.returned().orElse(today);
    long days = ChronoUnit.DAYS.between(loan.borrowedOn(), end);
    return Math.max(0, days - LOAN_DAYS);
}

static int fee(Loan loan, LocalDate today) {
    long late = daysLate(loan, today);
    if (late <= GRACE_DAYS) {
        return 0;
    }
    int cents = (int) Math.min(late * CENTS_PER_DAY, MAX_CENTS_PER_LOAN);
    return loan.member().type() == MemberType.CHILD ? cents / 2 : cents;
}
```

- **Konstanten** statt Zahlen im Code: `28` sagt nichts, `LOAN_DAYS` schon. Ändert sich die Regel, änderst du eine Zeile.
- `ChronoUnit.DAYS.between(a, b)` zählt die Tage von `a` bis `b`.
- `Math.min(…, MAX)` deckelt, `Math.max(0, …)` verhindert negative Werte.
- `static` und ohne `private`: Die Regel braucht keinen Zustand, und Tests im selben Package können sie direkt aufrufen.

:::achtung Lies die Grenzen genau
„Verspätungen bis einschließlich 2 Tage sind kostenlos“ heißt `late <= 2` → 0. Ab 3 Tagen zählen **alle** Tage, also 60 Cent – nicht 20. „Streams **unter** 5 Sekunden verwerfen“ heißt `< 5`, ein Stream mit genau 5 Sekunden zählt. Jede solche Grenze ist ein eigener Testfall (Einheit 5).
:::

## Filter als `Predicate`

„Nur die Ausleihen dieses Mitglieds“, „nur Antritte für diese Prüfung“: Solche Filter sind eigene Regeln.

```java
static Predicate<Loan> ofMember(Member member) {
    return loan -> loan.member().equals(member);
}
```

Die Hauptmethode setzt die Regeln mit einem Stream zusammen (Modul Stream API):

```java
public int feeFor(Member member, LocalDate today) {
    return loans.stream()
            .filter(ofMember(member))
            .mapToInt(loan -> fee(loan, today))
            .sum();
}
```

Liest man das laut, steht da die Angabe: „Von allen Ausleihen die des Mitglieds, jeweils die Gebühr, zusammengezählt.“

## Prozent-Regeln

Die Streaming-Angabe sagt: „Streams mit 85 % der Gesamtlänge werden mit der Gesamtlänge abgerechnet.“ Rechne mit ganzen Zahlen, um Rundungsfehler zu vermeiden:

```java
static int billedSeconds(int streamed, int songLength) {
    if (streamed < 5) {
        return 0;
    }
    return streamed * 100 >= songLength * 85 ? songLength : streamed;
}
```

`streamed * 100 >= songLength * 85` ist dasselbe wie `streamed / songLength >= 0.85` – ohne `double`.

## Geld

Beträge rechnest du in **Cent als `int`/`long`** oder mit `BigDecimal`, nie mit `double`: `0.1 + 0.2` ist in `double` `0.30000000000000004`.

:::merke
- Eine Regel = eine Methode, Zahlen als Konstanten.
- Filter als `Predicate`, die Hauptmethode als Stream aus Regeln.
- Grenzen („bis einschließlich“, „unter“) genau umsetzen.
- Geld in Cent oder `BigDecimal`, Prozent mit ganzen Zahlen.
:::
