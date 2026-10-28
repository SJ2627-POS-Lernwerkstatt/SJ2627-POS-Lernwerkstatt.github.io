---
title: Spring-Services testen
minutes: 9
cheatsheet: 19
status: draft
---

Ein Service-Test braucht **keinen** Spring-Kontext und keine Datenbank. Mockito ersetzt die Repositories, und der Test läuft in Millisekunden.

## Der Aufbau

```java
@ExtendWith(MockitoExtension.class)
class FeeReportServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Spy
    private FeeRules rules = new FeeRules();

    @InjectMocks
    private FeeReportService service;
}
```

- `@Mock` für das Repository: Jede Methode liefert eine leere Liste, `null` oder `0`, bis du etwas festlegst.
- `@Spy` für die echten Regeln: ein echtes Objekt, das Mockito trotzdem in den Service einsetzt.
- `@InjectMocks` erzeugt den Service über seinen Konstruktor mit Mock und Spy.

Kein `@SpringBootTest`, kein `@DataJpaTest`: Der Service ist eine normale Klasse.

:::achtung Fehlende Parameter werden `null`
`@InjectMocks` nimmt den Konstruktor mit den **meisten** Parametern. Für einen Parameter, zu dem es weder `@Mock` noch `@Spy` gibt, übergibt Mockito `null` – ohne Warnung. Fehlt hier der `@Spy`, scheitert der Test erst später mit `NullPointerException: … because "this.rules" is null`.
:::

## Guter Fall, Fehlerfall, Aufrufe

```java
@Test
void verify_fee_dto() {
    when(loanRepository.findByMemberName("Anna")).thenReturn(List.of(
            new Loan(ANNA, MALINA, START, START.plusDays(40)),
            new Loan(ANNA, MALINA, START, null)));

    FeeDto dto = service.feeFor("Anna", START.plusDays(31));

    assertThat(dto).isEqualTo(new FeeDto("Anna", 3.0, 1));
    verify(loanRepository).findByMemberName("Anna");
}

@Test
void verify_unknown_member() {
    when(loanRepository.findByMemberName("Zoe")).thenReturn(List.of());

    assertThatThrownBy(() -> service.feeFor("Zoe", START))
            .isInstanceOf(MemberNotFoundException.class)
            .hasMessage("no loans for member Zoe");
}
```

- **Guter Fall**: Das DTO wird als Ganzes verglichen – Records haben `equals`.
- **Fehlerfall**: Das Repository liefert nichts, der Service wirft die eigene Exception.
- `verify` prüft, dass der Service das Repository mit dem richtigen Namen gefragt hat.

## Schreibende Methoden prüfen

Ändert der Service etwas, prüfst du mit `verify` und einem `ArgumentCaptor`, **was** gespeichert wurde (Unit Testing, Einheit 12):

```java
verify(loanRepository).save(captor.capture());
assertThat(captor.getValue().returnedOn()).isEqualTo(TODAY);
```

## Welche Tests gehören dazu?

| Fall | Beispiel |
|---|---|
| guter Fall | ein Mitglied mit Gebühren |
| Randfall | ein Mitglied ohne Gebühren, eine offene Ausleihe |
| Fehlerfall | unbekanntes Mitglied, ungültiges Datum |

Diese drei Arten verlangt auch die Beurteilung von Aufgabe 3. Die Controller-Tests dort verwenden den Service selbst als Mock – den Service testest du also hier.

:::merke
- `@ExtendWith(MockitoExtension.class)`, `@Mock` für Repositories, `@InjectMocks` für den Service.
- Echte Hilfsklassen als `@Spy` oder direkt mit `new` übergeben.
- Gute Fälle, Randfälle und Fehlerfälle; `verify` für Aufrufe.
:::
