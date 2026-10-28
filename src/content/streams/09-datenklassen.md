---
title: Datenklassen mit Records
minutes: 8
cheatsheet: 2
status: draft
---

Bei Aufgabe 2 baust du zuerst die **Datenklassen** aus der Angabe, dann den Service, der mit ihnen rechnet. Für Daten, die sich nach dem Anlegen nicht mehr ändern, ist ein **Record** die kürzeste und sicherste Form. Die Grundlagen – Kompakt-Konstruktor, Zugriffsmethoden, wann Record und wann Klasse – sind in [Moderne Java Features – Records](/modern-java/records) erklärt; hier geht es um die Feinheiten.

## Ein Record

```java
public record Grade(String subject, int value) { }
```

Daraus erzeugt Java automatisch:

- `private final` Felder `subject` und `value`,
- einen Konstruktor mit allen Feldern in dieser Reihenfolge,
- Zugriffsmethoden `subject()` und `value()` (ohne `get`),
- `equals` und `hashCode` über **alle** Felder,
- `toString()` → `Grade[subject=POS, value=1]`.

Zwei Records mit gleichen Werten sind gleich – genau das brauchen `distinct`, `groupingBy` und AssertJs `isEqualTo`.

## Prüfen im kompakten Konstruktor

Ungültige Objekte sollen gar nicht erst entstehen. Im **kompakten Konstruktor** prüfst du die Werte, bevor sie gespeichert werden:

```java
public record Grade(String subject, int value) {
    public Grade {
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException("grade must be 1..5: " + value);
        }
    }
}
```

Die Parameter heißen wie die Felder, eine Zuweisung schreibst du nicht – die macht Java am Ende selbst.

## Listen in Records: Kopie anlegen

Ein Record ist nur so unveränderlich wie seine Felder. Eine übergebene `ArrayList` kann der Aufrufer später noch ändern:

```java
public record Student(String name, String schoolClass, int age, List<Grade> grades) {
    public Student {
        Objects.requireNonNull(name, "name");
        grades = List.copyOf(grades);   // unveränderliche Kopie
    }
}
```

`List.copyOf` erzeugt eine **unveränderliche Kopie**: Ändert jemand die ursprüngliche Liste, merkt der Student nichts davon, und `student.grades().add(...)` wirft eine `UnsupportedOperationException`.

## Ändern heißt: neu anlegen

Einen Record kann man nicht ändern. Brauchst du einen anderen Wert, legst du ein neues Objekt an:

```java
Student older = new Student(s.name(), s.schoolClass(), s.age() + 1, s.grades());
```

## Und wenn es eine Klasse sein muss?

Entities (Aufgabe 1) und Objekte mit veränderlichem Zustand sind normale Klassen. Auch dort gilt: Gib interne Listen nicht direkt heraus, sonst kann jeder von außen Elemente hinzufügen.

```java
public class Course {
    private final List<String> students = new ArrayList<>();

    public void enroll(String student) {      // Änderungen nur über eigene Methoden
        students.add(student);
    }

    public List<String> getStudents() {
        return List.copyOf(students);         // oder Collections.unmodifiableList(students)
    }
}
```

:::pruefung
Die Angabe von Aufgabe 2 beschreibt die Datenklassen oft als Pseudocode oder UML. Ein Record mit Prüfung im kompakten Konstruktor erfüllt „Datenklassen korrekt implementiert“ mit wenig Code – und die Prüfungen sind gleich ein guter Anlass für Exception-Tests.
:::

:::merke
- `record Name(Typ feld, ...)`: Konstruktor, Zugriff `feld()`, `equals`, `hashCode`, `toString` inklusive.
- Prüfungen im kompakten Konstruktor `public Name { ... }`.
- Listen mit `List.copyOf` kopieren; Klassen geben Listen nur als unveränderliche Kopie heraus.
:::
