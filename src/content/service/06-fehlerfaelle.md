---
title: Fehlerfälle und eigene Exceptions
minutes: 8
status: draft
---

Was soll der Service tun, wenn die Eingabe keinen Sinn ergibt? Die Angabe sagt es nicht immer – aber eine gute Lösung entscheidet es und testet es.

## Ungültige Argumente

```java
public LateFeeService(List<Loan> loans) {
    if (loans == null) {
        throw new IllegalArgumentException("loans must not be null");
    }
    this.loans = List.copyOf(loans);
}
```

```java
public record Loan(Member member, Book book, LocalDate borrowedOn, LocalDate returnedOn) {

    public Loan {
        if (member == null) {
            throw new IllegalArgumentException("member must not be null");
        }
        if (borrowedOn == null) {
            throw new IllegalArgumentException("borrowedOn must not be null");
        }
        if (returnedOn != null && returnedOn.isBefore(borrowedOn)) {
            throw new IllegalArgumentException("returnedOn before borrowedOn");
        }
    }
}
```

| Situation | Exception |
|---|---|
| Ein Pflichtwert ist `null` | `IllegalArgumentException` |
| Ein Wert ist unsinnig (negativ, Ende vor Anfang) | `IllegalArgumentException` |
| Etwas Gesuchtes gibt es nicht | eigene Exception, z. B. `MemberNotFoundException` |

Prüfst du im kompakten Konstruktor des Records, kann es ein ungültiges Objekt gar nicht geben – der Service muss sich dann nicht mehr darum kümmern.

:::info Kürzer mit `Objects.requireNonNull`
Java hat für die `null`-Prüfung eine fertige Methode: `Objects.requireNonNull(member, "member");` macht in einer Zeile dasselbe wie das `if`, wirft aber eine `NullPointerException` mit der Nachricht `"member"`. Beides ist richtig – wichtig ist nur, dass du prüfst.
:::

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
- Fehlende Pflichtwerte und unsinnige Werte mit `if` prüfen und eine `IllegalArgumentException` werfen.
- Prüfungen in den kompakten Konstruktor der Records.
- Eigene Exceptions `extends RuntimeException` mit sprechendem Namen.
- Testen mit `assertThatThrownBy`: Typ und Nachricht.
:::
