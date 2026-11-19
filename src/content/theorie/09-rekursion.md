---
title: "Theoriefrage: Rekursion"
minutes: 8
status: draft
---

So könnte die Fragestellung lauten:

> Was ist **Rekursion**? Erkläre an einem Beispiel, wie ein rekursiver Aufruf abläuft und woraus eine rekursive Lösung besteht. Welche Eigenschaften muss ein Problem haben, damit man es rekursiv lösen kann, und für welche typischen Aufgaben setzt man Rekursion ein?

## Schreibübung

Nimm dir **5 Minuten** und schreib deine Antwort in Stichworten. Erst dann weiterlesen.

## Das Wissen dahinter

**Rekursion:** Eine Methode ruft **sich selbst** auf – mit einem **kleineren** Teil des Problems –, bis das Problem so klein ist, dass die Antwort direkt feststeht.

```java
static long factorial(int n) {
    if (n <= 1) {                    // Abbruchbedingung (Basisfall)
        return 1;
    }
    return n * factorial(n - 1);     // rekursiver Aufruf mit kleinerem Problem
}
```

Ablauf von `factorial(4)`:

```
factorial(4) = 4 * factorial(3)
             = 4 * 3 * factorial(2)
             = 4 * 3 * 2 * factorial(1)
             = 4 * 3 * 2 * 1                ← Basisfall erreicht, jetzt wird zurückgerechnet
             = 24
```

Jeder Aufruf bekommt einen eigenen Eintrag auf dem **Call Stack** (eigene Parameter und lokale Variablen). Fehlt die Abbruchbedingung oder wird das Problem nicht kleiner, wächst der Stack, bis ein **`StackOverflowError`** kommt.

**Bestandteile:**

1. **Basisfall / Abbruchbedingung** – direkt lösbar, ohne Selbstaufruf.
2. **Rekursionsschritt** – Problem verkleinern und die Methode selbst aufrufen.
3. **Zusammensetzen** – aus dem Teilergebnis das Gesamtergebnis bilden (hier: `n * …`).

**Voraussetzung an das Problem:** Es lässt sich in **gleichartige, kleinere Teilprobleme** zerlegen, und es gibt einen **kleinsten Fall** mit bekannter Lösung (*selbstähnliche* Struktur, „Teile und herrsche“).

**Klassische Probleme:**

- mathematisch: Fakultät, Fibonacci, größter gemeinsamer Teiler (Euklid), Potenz
- **Baum- und Verzeichnisstrukturen** durchlaufen (Dateisystem, DOM, Kategorien mit Unterkategorien, JSON)
- **Teile und herrsche:** Quicksort, Mergesort, binäre Suche
- **Backtracking:** Türme von Hanoi, Labyrinth, Sudoku, 8-Damen-Problem, alle Permutationen

**Rekursion vs. Schleife (Iteration):** Jede Rekursion lässt sich auch iterativ lösen. Rekursion ist oft kürzer und näher an der Definition, braucht aber Stack-Speicher und ist etwas langsamer. Naive Rekursion kann Arbeit wiederholen (Fibonacci) → **Memoization**.

## Musterantwort

> Bei **Rekursion** ruft sich eine Methode selbst auf, um ein Problem zu lösen, indem sie es auf eine kleinere Version desselben Problems zurückführt. Eine rekursive Lösung besteht aus einer **Abbruchbedingung** (Basisfall), die ohne weiteren Aufruf ein Ergebnis liefert, und einem **Rekursionsschritt**, der das Problem verkleinert, sich selbst aufruft und das Teilergebnis zum Gesamtergebnis zusammensetzt. Jeder Aufruf erhält einen eigenen Eintrag am Call Stack; fehlt die Abbruchbedingung, kommt es zu einem `StackOverflowError`.
>
> Beispiel Fakultät: `factorial(n)` gibt für `n <= 1` den Wert 1 zurück, sonst `n * factorial(n - 1)`. `factorial(4)` ruft `factorial(3)`, `factorial(2)` und `factorial(1)` auf; danach werden die Ergebnisse von innen nach außen multipliziert: 1, 2, 6, 24.
>
> Ein Problem eignet sich für Rekursion, wenn es sich in gleichartige, kleinere Teilprobleme zerlegen lässt und es einen kleinsten Fall mit bekannter Lösung gibt. Klassische Beispiele sind Fakultät und Fibonacci, das Durchlaufen von Bäumen und Verzeichnisstrukturen, Sortierverfahren nach dem Prinzip „Teile und herrsche“ wie Quicksort und Mergesort, die binäre Suche sowie Backtracking-Probleme wie die Türme von Hanoi oder Sudoku. Jede Rekursion kann auch iterativ gelöst werden; die rekursive Variante ist oft lesbarer, braucht aber mehr Speicher.

:::pruefung
Checkliste – hast du …
- Rekursion **definiert** (Methode ruft sich selbst mit kleinerem Problem auf)?
- ein **Beispiel** mit Code und Ablauf gezeigt?
- **Abbruchbedingung** und **Rekursionsschritt** benannt?
- **Call Stack** / `StackOverflowError` erwähnt?
- die **Voraussetzung** an das Problem genannt (selbstähnlich, kleinster Fall)?
- mehrere **klassische Probleme** aufgezählt (Bäume, Sortieren, Backtracking …)?
:::
