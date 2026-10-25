# Curriculum outline

Draft unit list per module (core units only; Vertiefung units were dropped on 2026-10-25). Numbers in brackets = cheat sheet page. Each unit gets 2–4 question groups in the pool.

## 1 · Unit Testing (Auffrischung)
1. Aufbau eines Tests: Arrange / Act / Assert, `@Test`, die richtigen Imports (`org.junit.jupiter.api`) [4]
2. Lebenszyklus: `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll` [4]
3. Tests lesbar machen: `@DisplayName`, `@Nested`, `@Disabled`, Testnamen [4]
4. AssertJ Grundlagen: `assertThat`, `isEqualTo`, `isNotNull`, `isTrue`, AssertJ vs. JUnit-Assertions [6]
5. AssertJ Collections: `hasSize`, `contains`, `containsExactly(InAnyOrder)`, `extracting`, `isEmpty` [6]
6. AssertJ verketten: `satisfies`, `hasValueSatisfying` (Optional) [6]
7. Exceptions testen: `assertThatThrownBy`, `assertThatExceptionOfType`, `assertThrows`
8. Parametrisierte Tests I: `@ValueSource`, `@CsvSource`, `@NullSource`, `@EmptySource`, `@EnumSource` [4–5]
9. Parametrisierte Tests II: `@MethodSource`, `@FieldSource`, `Arguments` [5]
10. Testdaten: Fixtures, Hilfsmethoden, Randwerte finden
11. Mockito I: `@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`, `when … thenReturn` [5]
12. Mockito II: `verify`, `times`, `any()`, `doThrow` für void, `returnsFirstArg` [6]

## 2 · Stream API (Auffrischung)
1. Lambdas und Methodenreferenzen: `Predicate`, `Function`, `Consumer`, `Supplier`
2. Streams erzeugen, `filter`, `map`, `toList()` vs. `collect(Collectors.toList())` [2–3]
3. Sortieren: `sorted`, `Comparator.comparing`, `thenComparing`, `reversed` [3]
4. `distinct`, `limit`, `skip`, `peek` [3]
5. Prüfen und Finden: `anyMatch`/`allMatch`/`noneMatch`, `findFirst`, `min`/`max`, `Optional` richtig verwenden [3]
6. Zahlen: `mapToInt`/`mapToLong`, `sum`, `average`, `reduce` [3]
7. `flatMap`: verschachtelte Listen auflösen [2]
8. Collectors: `groupingBy`, `counting`, `summingLong`, `toMap`, `partitioningBy`
9. Datenklassen: Records, Konstruktor, `equals`/`hashCode`, Collections kapseln, Unveränderlichkeit [2]

## 3 · Spring Data JPA (Aufgabe 1)
1. Vom UML zum Code: Entity, Value Object, Rich Type, Enumeration, `{nn}`. Wie lese ich die Angabe? [9–12]
2. Das erste Entity: `@Entity`, `@Table`, `@Id`/`@GeneratedValue`, `AbstractPersistable` [8–9]
3. Entity-Klassen richtig bauen: protected No-Args-Konstruktor, fachlicher Konstruktor, Getter, gekapselte Listen [2]
4. Basisattribute: `@Column` (length, nullable, unique, precision/scale), `@NotNull`, `@Size`, reservierte Wörter [13]
5. Repositories: `CrudRepository` vs. `JpaRepository`, der erste `@DataJpaTest` (Lifecycle-Test) [8, 17]
6. Enums: das Ordinal-Problem, `@Enumerated(EnumType.STRING)`, null-sicherer `AttributeConverter` mit Codes [12]
7. Value Objects: `@Embeddable` (Klasse oder Record), `@Embedded`, `@EmbeddedColumnNaming`, `@AttributeOverrides` [10, 14]
8. Rich Types: eine Spalte via `@Converter` (z. B. `RoomName`, `Email`) [11]
9. `@ManyToOne` und `@JoinColumn`, benannte Foreign Keys (`@ForeignKey`) [13]
10. `@OneToMany` bidirektional: `mappedBy`, Hilfsmethoden, Cascade [14]
11. `@ManyToMany` und `@JoinTable` [14–15]
12. `@OneToOne` [13–14]
13. `@ElementCollection` und `@CollectionTable` [15]
14. Vererbung: `SINGLE_TABLE`, `JOINED`, `TABLE_PER_CLASS`, Discriminator, `@MappedSuperclass` [13]
15. Objektgraphen speichern und lesen testen (Cascade, `TestEntityManager`, `flush`/`clear`)
16. Abgeleitete Queries (Methodennamen) [16]
17. `@Query` mit JPQL: Joins, Parameter [16]
18. Projektionen und Aggregate: Konstruktor-Ausdruck, Records, `sum … group by` [16]
19. Für „Sehr gut“: Constraints und Fremdschlüssel sinnvoll benennen, Precision

Exercises (autograded): one per 2–3 units from unit 5 on, the last two in full Aufgabe-1 size.

## 4 · Service-Schicht (Aufgabe 2)
1. Wo sitzt das Service? Schichtenmodell (Mermaid) und was Aufgabe 2 verlangt
2. Pseudocode der Angabe in Java übersetzen: Datenklassen, Service-Konstruktor, Methodensignaturen
3. Geschäftsregeln als eigene Methoden und Predicates (z. B. „unter 5 Sekunden verwerfen“, „ab 85 % voll abrechnen“)
4. Testdaten aufbauen: alle Geschäftsfälle abdecken, Randwerte mit parametrisierten Tests
5. Fehlerfälle: ungültige Argumente, eigene Exceptions, testen mit `assertThatThrownBy`
6. Für „Sehr gut“: auf mehrere Klassen aufteilen (Regeln, Berechnung, Service)
7. Spring-Service: `@Service`, Constructor Injection, `@Transactional` [18–19]
8. DTOs als Records und das Mapping Entity ↔ DTO [19]
9. Spring-Services testen: Mockito statt Datenbank [19]

Exercises (teacher feedback): 3 tasks in Aufgabe-2 size.

## 5 · REST-Controller (Aufgabe 3)
1. REST-Grundlagen: Ressourcen, Pfade, HTTP-Methoden, Statuscodes (Mermaid-Sequenz)
2. `@RestController`, `@RequestMapping`, `@GetMapping`, `ResponseEntity` [20–21]
3. `@PathVariable` und `@RequestParam` [21]
4. Anlegen: `@PostMapping`, `@RequestBody`, `201 Created` mit `Location`-Header
5. Ersetzen, Ändern, Löschen: `PUT`, `PATCH`, `DELETE`, idempotent? Was tun bei „existiert schon“ / „existiert nicht“?
6. Validierung: `@Valid`, Bean Validation auf DTOs, `400`, `BindingResult` [7, 21]
7. Fehlerbehandlung: `ProblemDetail`, `@ExceptionHandler`, `@RestControllerAdvice` [21–22]
8. JSON: Request- und Response-DTOs, verschachtelte Objekte, Jackson 3
9. Das Service als Stub, `@WebMvcTest` und `@MockitoBean` [5, 22]
10. MockMvc: `perform`, `status`, `jsonPath`, JSON-Body mit `ObjectMapper` [22]
11. Teststrategie nach Beurteilung: Good Cases → Edge Cases → Exception Cases
12. Unterressourcen: `/api/reservations/{id}/rooms`

Exercises (teacher feedback): 3 tasks in Aufgabe-3 size, one with a sub-resource, one with pagination.

## 6 · Probeprüfungen
- 2 × small (one task each, JPA and REST)
- 2 × medium (JPA + service, service + REST)
- 3 × full (300 min, Matura size; JPA part autograded)
