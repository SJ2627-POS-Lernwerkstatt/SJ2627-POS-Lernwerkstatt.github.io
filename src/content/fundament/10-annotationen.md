---
title: Annotationen – Zettel am Code
minutes: 6
status: draft
---

Eine Annotation (`@Irgendwas`) ist ein **Zettel**, den du an eine Klasse, ein Feld, eine Methode oder einen Parameter klebst. Sie tut selbst gar nichts. Es kommt darauf an, **wer den Zettel liest**.

| Wer liest? | Wann? | Beispiele |
|---|---|---|
| der Compiler | beim Kompilieren | `@Override` |
| Lombok | beim Kompilieren – erzeugt Code | `@Getter`, `@Setter`, `@NoArgsConstructor`, `@RequiredArgsConstructor` |
| Hibernate (JPA) | beim Start und beim Speichern | `@Entity`, `@Table`, `@Column`, `@ManyToOne`, `@Enumerated` |
| Spring | beim Start | `@Service`, `@RestController`, `@GetMapping`, `@Transactional` |
| JUnit | beim Testen | `@Test`, `@BeforeEach`, `@ParameterizedTest` |
| Bean Validation | beim Prüfen | `@NotNull`, `@Size`, `@Valid` |

Darum ist ein Tippfehler oder eine **fehlende** Annotation so tückisch: Der Code kompiliert, aber Hibernate oder Spring sehen den Zettel nicht und verhalten sich anders. Ohne `@Entity` gibt es keine Tabelle, ohne `@Service` findet Spring die Klasse nicht.

## Annotationen mit Werten

Viele Annotationen nehmen Einstellungen in Klammern:

```java
@Table(name = "books")
@Column(length = 13, nullable = false, unique = true)
@Enumerated(EnumType.STRING)
@GetMapping("/{id}")                  // nur ein Wert namens value → Name darf wegfallen
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

## Woher kommt die Annotation?

Jede Annotation braucht einen **Import**. Die IDE schlägt oft mehrere gleichnamige vor – nimm die richtige:

| Annotation | richtig | falsch |
|---|---|---|
| `@Test` | `org.junit.jupiter.api.Test` | `org.junit.Test` (JUnit 4) |
| `@Id` | `jakarta.persistence.Id` | `org.springframework.data.annotation.Id` |
| `@Transactional` | `org.springframework.transaction.annotation.Transactional` | `jakarta.transaction.Transactional` geht auch, ist aber nicht die übliche Wahl |

:::merke
- Annotation = Zettel mit Information. Wirkung hat sie nur, weil ein Werkzeug sie liest.
- Fehlt eine Annotation, kompiliert der Code oft trotzdem – der Fehler zeigt sich erst beim Start oder im Test.
- Werte in Klammern: `name = …`. Nur `value` → Name weglassen.
- Auf den Import achten.
:::
