---
title: Interfaces – ein Versprechen ohne Code
minutes: 9
status: draft
mindest: true
---

Ein **Interface** sagt, *was* eine Klasse können muss, aber nicht *wie*. Es ist ein Vertrag: „Wer mich implementiert, hat diese Methoden.“

```java
public interface LateFeePolicy {
    int feeInCents(int daysLate);   // kein Rumpf, nur die Signatur
}
```

Eine Klasse **erfüllt** den Vertrag mit `implements` und muss dann jede Methode ausprogrammieren:

```java
public class StandardPolicy implements LateFeePolicy {
    @Override
    public int feeInCents(int daysLate) {
        return daysLate * 50;
    }
}

public class StudentPolicy implements LateFeePolicy {
    @Override
    public int feeInCents(int daysLate) {
        return Math.max(0, daysLate - 3) * 20;   // 3 Tage gratis, dann billiger
    }
}
```

Fehlt eine Methode, kompiliert die Klasse nicht: *StandardPolicy is not abstract and does not override abstract method feeInCents(int)*.

## Wozu das Ganze?

Code, der nur das **Interface** kennt, funktioniert mit **jeder** Implementierung:

```java
public class Library {
    private final LateFeePolicy policy;

    public Library(LateFeePolicy policy) {
        this.policy = policy;
    }

    public int fee(int daysLate) {
        return policy.feeInCents(daysLate);   // welche Regel? egal – Hauptsache, sie hält den Vertrag
    }
}

new Library(new StandardPolicy()).fee(5);   // 250
new Library(new StudentPolicy()).fee(5);    // 40
```

`Library` muss nicht geändert werden, wenn morgen eine `SeniorPolicy` dazukommt. Und im Test kannst du eine einfache Fake-Regel übergeben.

## Interfaces in der Matura

Du benutzt Interfaces ständig, auch wenn du sie selten selbst schreibst:

| Wo | Interface | Wer implementiert? |
|---|---|---|
| Aufgabe 1 | `interface BookRepository extends JpaRepository<Book, Long>` | Spring Data, beim Start automatisch |
| Aufgabe 1 | `AttributeConverter<Genre, String>` | du, im Converter |
| Aufgabe 2 | ein Repository- oder Datenzugriff-Interface | ein Stub oder Mock im Test |
| überall | `List`, `Map`, `Comparator`, `Predicate` | `ArrayList`, `HashMap`, Lambdas … |

Darum schreibt man `List<Book> books = new ArrayList<>();`: Links steht der Vertrag (`List`), rechts die konkrete Klasse (`ArrayList`).

:::achtung
Ein Interface kann man nicht mit `new` erzeugen: `new LateFeePolicy()` kompiliert nicht. Es fehlt ja das *Wie*.
:::

:::merke
- `interface` = Liste von Methoden ohne Rumpf, ein Vertrag.
- `class X implements I` muss alle Methoden von `I` ausprogrammieren.
- Variablen und Parameter vom Interface-Typ nehmen jede Implementierung an.
- Spring Data implementiert deine Repository-Interfaces selbst.
:::
