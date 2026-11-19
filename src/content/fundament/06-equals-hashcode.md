---
title: "== oder equals? Und warum hashCode dazugehört"
minutes: 8
status: draft
---

`==` fragt: **Dasselbe Objekt?** (zeigen beide Variablen auf dieselbe Stelle?)
`equals` fragt: **Gleicher Inhalt?** – und zwar so, wie die Klasse „gleich“ definiert.

```java
String a = new String("Hobbit");
String b = new String("Hobbit");

System.out.println(a == b);       // false – zwei verschiedene Objekte
System.out.println(a.equals(b));  // true  – gleicher Text
```

:::achtung
Strings, `Integer`, `Long`, `BigDecimal`, Datumswerte und alle eigenen Objekte vergleichst du mit `equals`. `==` nur bei primitiven Typen (`int`, `long`, `boolean`, …) und bei Enums.
:::

## Ohne eigenes `equals` zählt nur die Identität

Schreibst du kein `equals`, erbt die Klasse das von `Object` – und das macht dasselbe wie `==`:

```java
public class Isbn {
    private final String value;
    public Isbn(String value) { this.value = value; }
}

new Isbn("9783608938289").equals(new Isbn("9783608938289"));  // false!
```

Für Werte wie eine ISBN ist das falsch. Also überschreiben:

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Isbn other)) return false;
    return value.equals(other.value);
}

@Override
public int hashCode() {
    return value.hashCode();
}
```

## Warum `hashCode` immer mit muss

`HashSet` und `HashMap` suchen zuerst über `hashCode` die richtige „Schublade“ und vergleichen erst darin mit `equals`. Die Regel: **Gleiche Objekte müssen den gleichen hashCode haben.** Überschreibst du nur `equals`, landet die zweite ISBN in einer anderen Schublade, und `set.contains(…)` findet sie nicht.

## Du musst es selten selbst schreiben

| Typ | `equals`/`hashCode` |
|---|---|
| `record` | automatisch über alle Komponenten – darum sind Records ideal für Value Objects und DTOs |
| Entity mit `AbstractPersistable` | über die **Id** (zwei Objekte = derselbe Datensatz) |
| Lombok `@EqualsAndHashCode` / `@Data` | über alle Felder – an Entities **nicht** verwenden, es ersetzt das von `AbstractPersistable` |

:::merke
- `==` = dasselbe Objekt, `equals` = gleicher Inhalt. Objekte immer mit `equals` vergleichen.
- `equals` und `hashCode` werden **immer gemeinsam** überschrieben.
- Records erledigen das selbst, Entities über `AbstractPersistable`.
:::
