---
title: "Datenzugriff als Interface: Stub oder Mock"
minutes: 10
status: draft
---

„Es ist eine Datenzugriffsschnittstelle anzunehmen, welche das gegebene Modell zur Verarbeitung zurückliefert. Die Datenzugriffsklassen sollen in den Tests gemockt oder durch Stubs ersetzt werden.“

Der Service holt sich seine Daten dann nicht über den Konstruktor, sondern über ein **Interface**. Eine Implementierung mit Datenbank gibt es nicht – du brauchst sie auch nicht.

## Das Interface

```java
package businessservice.persistence;

public interface LoanRepository {

    List<Loan> findAll();

    List<Loan> findByMemberName(String name);
}
```

Der Service bekommt das Interface im Konstruktor:

```java
public class FeeReportService {

    private final LoanRepository loanRepository;

    public FeeReportService(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public int feeFor(String memberName, LocalDate today) {
        List<Loan> loans = loanRepository.findByMemberName(memberName);
        if (loans.isEmpty()) {
            throw new MemberNotFoundException(memberName);
        }
        return loans.stream().mapToInt(loan -> LateFeeService.fee(loan, today)).sum();
    }
}
```

Der Service weiß nicht, woher die Daten kommen. Genau das macht ihn testbar.

## Variante 1: ein Stub

Ein **Stub** ist eine einfache Implementierung, die feste Daten liefert:

```java
LoanRepository stub = new LoanRepository() {
    @Override
    public List<Loan> findAll() {
        return List.of(LOAN_ANNA, LOAN_CARLA);
    }

    @Override
    public List<Loan> findByMemberName(String name) {
        return findAll().stream().filter(l -> l.member().name().equals(name)).toList();
    }
};

FeeReportService service = new FeeReportService(stub);
```

Hat das Interface nur **eine** Methode, reicht ein Lambda: `LoanSource stub = () -> List.of(LOAN_ANNA);`. Einen Stub kannst du auch als eigene Klasse im Testordner anlegen, z. B. `InMemoryLoanRepository` mit einer Liste im Konstruktor.

## Variante 2: ein Mock mit Mockito

Mockito kennst du aus dem Modul Unit Testing (Einheiten 11 und 12):

```java
@ExtendWith(MockitoExtension.class)
class FeeReportServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @InjectMocks
    private FeeReportService service;

    @Test
    void verify_fee_for_member() {
        when(loanRepository.findByMemberName("Anna")).thenReturn(List.of(
                returnedAfter(ANNA, 40), openLoan(ANNA)));

        assertThat(service.feeFor("Anna", START.plusDays(31))).isEqualTo(300);
        verify(loanRepository).findByMemberName("Anna");
    }
}
```

| | Stub | Mock |
|---|---|---|
| Aufwand | eigene Klasse oder anonyme Klasse | eine Zeile `when(…).thenReturn(…)` pro Aufruf |
| Prüft Aufrufe | nein | ja, mit `verify` |
| Gut, wenn … | viele Tests dieselben Daten brauchen | jeder Test andere Daten braucht |

Beides erfüllt die Angabe. Mit Mockito bist du meist schneller.

:::achtung Strikte Stubs
`MockitoExtension` meldet ein `when(…)`, das im Test nie gebraucht wird, als `UnnecessaryStubbingException`. Lege nur fest, was der Service wirklich aufruft.
:::

:::merke
- Datenzugriff = Interface im Konstruktor des Service, ohne Implementierung.
- Stub: feste Daten in einer (anonymen) Klasse oder einem Lambda.
- Mock: `@Mock` + `@InjectMocks`, `when … thenReturn`, `verify`.
:::
