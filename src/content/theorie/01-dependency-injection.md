---
title: "Theoriefrage: Dependency Injection"
minutes: 10
status: draft
---

So könnte die Fragestellung lauten:

> Ein Kollege erzeugt in seinem `OrderService` alle benötigten Objekte selbst mit `new` und wundert sich, warum er die Klasse nicht vernünftig testen kann. Erklär ihm, was **Dependency Injection** an dieser Stelle ändern würde: Wer übernimmt dann welche Aufgabe, und wie erledigt Spring das für dich? Untermauere deine Erklärung mit ein paar Zeilen Code.

Die Grundlagen stehen in [Was macht Spring eigentlich für mich?](/fundament/spring-di). Hier geht es darum, eine **gute Antwort zu schreiben**.

## Schreibübung

Nimm dir **5 Minuten**, schreib deine Antwort in Stichworten (Handy-Notiz oder Papier) und vergleiche erst dann mit der Musterantwort unten. Abschreiben bringt nichts – Erinnern bringt die Punkte.

## Was in die Antwort gehört

1. **Definition:** Ein Objekt erzeugt seine Abhängigkeiten nicht selbst (`new`), sondern bekommt sie **von außen** übergeben.
2. **Das Problem ohne DI:** Feste Kopplung. Wer `new MySqlBookRepository()` selbst aufruft, kann die Implementierung nicht austauschen – weder für einen Test noch für eine andere Datenbank.
3. **Bestandteile:**
   - **Abhängigkeit** (Service, Dependency) – meist über ein Interface beschrieben,
   - **Client** – die Klasse, die die Abhängigkeit braucht,
   - **Injector / Container** – baut die Objekte und reicht sie weiter (in Spring: der ApplicationContext, die Objekte heißen **Beans**).
4. **Arten:** Konstruktor-Injection (empfohlen), Setter-Injection, Feld-Injection (`@Autowired` am Feld – vermeiden).
5. **Beispiel** in Spring.
6. **Nutzen:** Austauschbarkeit, Testbarkeit (Mock statt echter Klasse), lose Kopplung, eine zentrale Stelle, die die Anwendung zusammensteckt.

## Musterantwort

> Bei **Dependency Injection** erzeugt eine Klasse die Objekte, von denen sie abhängt, nicht selbst, sondern bekommt sie von außen übergeben – meist über den Konstruktor. Ohne DI würde z. B. ein `BookService` sein Repository mit `new JpaBookRepository()` selbst bauen. Dann ist er fest an diese Implementierung gekoppelt und lässt sich nicht isoliert testen.
>
> Beteiligt sind drei Rollen: die **Abhängigkeit** (z. B. `BookRepository`, beschrieben durch ein Interface), der **Client**, der sie benutzt (`BookService`), und der **Injector** bzw. **Container**, der alle Objekte erzeugt und verbindet. In Spring Boot ist das der ApplicationContext: Klassen mit `@Service`, `@Repository`, `@RestController` oder `@Component` werden beim Start als **Beans** angelegt und dort übergeben, wo ein Konstruktor sie verlangt.
>
> ```java
> @Service
> public class BookService {
>     private final BookRepository repository;
>
>     public BookService(BookRepository repository) {   // Konstruktor-Injection
>         this.repository = repository;
>     }
> }
> ```
>
> Vorteile: lose Kopplung (der Service kennt nur das Interface), Austauschbarkeit und vor allem **Testbarkeit** – im Unit-Test übergebe ich einen Mock (`@Mock`/`@InjectMocks`, im Controller-Test `@MockitoBean`). Konstruktor-Injection ist der empfohlene Weg, weil die Abhängigkeiten `final` sein können und das Objekt nie ohne sie existiert.

:::pruefung
Checkliste – hast du …
- DI in **einem Satz** definiert („von außen übergeben statt selbst erzeugen“)?
- das **Problem** genannt (feste Kopplung, schlecht testbar)?
- die drei **Rollen** genannt (Abhängigkeit, Client, Injector/Container)?
- **Spring** konkret gemacht (Beans, `@Service`, Konstruktor-Injection, `@RequiredArgsConstructor`)?
- ein **Codebeispiel** gegeben?
- den **Nutzen beim Testen** erwähnt (Mock)?
:::
