---
title: Fehlerfälle und eigene Exceptions
minutes: 8
status: draft
---

Was soll der Service tun, wenn die Eingabe keinen Sinn ergibt? Die Angabe sagt es nicht immer – aber eine gute Lösung entscheidet es und testet es.

## Ungültige Argumente

```java
public LateFeeService(List<Loan> loans) {
    this.loans = List.copyOf(Objects.requireNonNull(loans, "loans"));
}
```

```java
public record Loan(Member member, Book book, LocalDate borrowedOn, LocalDate returnedOn) {

    public Loan {
        Objects.requireNonNull(member, "member");
        Objects.requireNonNull(borrowedOn, "borrowedOn");
        if (returnedOn != null && returnedOn.isBefore(borrowedOn)) {
            throw new IllegalArgumentException("returnedOn before borrowedOn");
        }
    }
}
```

| Situation | Exception |
|---|---|
| Ein Pflichtwert ist `null` | `NullPointerException` über `Objects.requireNonNull` |
| Ein Wert ist unsinnig (negativ, Ende vor Anfang) | `IllegalArgumentException` |
| Etwas Gesuchtes gibt es nicht | eigene Exception, z. B. `MemberNotFoundException` |

Prüfst du im kompakten Konstruktor des Records, kann es ein ungültiges Objekt gar nicht geben – der Service muss sich dann nicht mehr darum kümmern.

## Eine eigene Exception

```java
public class MemberNotFoundException extends RuntimeException {

    public MemberNotFoundException(String name) {
        super("no loans for member " + name);
    }
}
```

- `extends RuntimeException`: Niemand muss sie mit `throws` deklarieren oder fangen.
- Der Name sagt, was passiert ist. In Aufgabe 3 macht der Controller daraus den Statuscode `404`.

## Testen mit `assertThatThrownBy`

```java
@Test
void verify_invalid_loan_is_rejected() {
    assertThatThrownBy(() -> new Loan(ANNA, MALINA, START, START.minusDays(1)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("returnedOn");
}

@Test
void verify_unknown_member() {
    assertThatThrownBy(() -> service.feeFor("Zoe", TODAY))
            .isInstanceOf(MemberNotFoundException.class)
            .hasMessage("no loans for member Zoe");
}
```

Prüfe den **Typ** und einen Teil der **Nachricht**. Nur `isInstanceOf(RuntimeException.class)` würde auch einen zufälligen Fehler im Service als „richtig“ werten.

:::achtung Leere Daten sind kein Fehler
Eine leere Liste von Ausleihen ist erlaubt: Die Summe ist 0, die Auswertung hat drei leere Listen. Wirf nur dann eine Exception, wenn das Ergebnis sonst falsch oder sinnlos wäre.
:::

:::merke
- `Objects.requireNonNull` für Pflichtwerte, `IllegalArgumentException` für unsinnige Werte.
- Prüfungen in den kompakten Konstruktor der Records.
- Eigene Exceptions `extends RuntimeException` mit sprechendem Namen.
- Testen mit `assertThatThrownBy`: Typ und Nachricht.
:::
