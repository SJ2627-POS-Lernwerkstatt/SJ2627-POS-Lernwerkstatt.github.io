---
title: Das Service in Spring
minutes: 10
cheatsheet: 18
status: draft
---

In Aufgabe 2 ist das Service reines Java. In einer echten Anwendung – und in Aufgabe 3 – verwaltet **Spring** die Objekte: Es erzeugt das Service und übergibt ihm Repository und Regeln.

## `@Service` und Constructor Injection

```java
@Service
public class FeeReportService {

    private final LoanRepository loanRepository;
    private final FeeRules rules;

    public FeeReportService(LoanRepository loanRepository, FeeRules rules) {
        this.loanRepository = loanRepository;
        this.rules = rules;
    }
}
```

- `@Service` macht die Klasse zu einer **Bean**: Spring erzeugt genau ein Objekt davon.
- Hat die Klasse genau einen Konstruktor, übergibt Spring dort die passenden Beans. Ein `@Autowired` ist nicht nötig.
- Die Felder sind `final`: Nach dem Konstruktor ändert sich nichts mehr.

:::achtung Jede Abhängigkeit braucht eine Bean
Hat `LoanRepository` keine Implementierung, startet der Spring-Kontext nicht – und der Test `contextLoads` aus dem Seed-Projekt scheitert:

```text
Parameter 0 of constructor in businessservice.service.FeeReportService
required a bean of type 'businessservice.persistence.LoanRepository' that could not be found.
```

In Aufgabe 2 verzichtest du deshalb auf `@Service`, oder du legst eine einfache Implementierung mit `@Repository` an, die leere Listen liefert. Mit Spring Data JPA ist das Repository-Interface selbst die Bean.
:::

`FeeRules` braucht ebenfalls eine Bean, etwa mit `@Component` an der Klasse.

## `@Transactional`

In einem Projekt mit Spring Data JPA läuft jede Service-Methode, die Daten ändert, in einer Transaktion:

```java
@Service
@Transactional(readOnly = true)
public class LoanService {

    @Transactional
    public Loan returnBook(Long loanId, LocalDate on) { ... }
}
```

- An der Klasse `readOnly = true` für alle lesenden Methoden.
- An Methoden, die schreiben, `@Transactional` ohne `readOnly`. Scheitert die Methode mit einer `RuntimeException`, wird alles zurückgerollt.
- Im Subprojekt `Aufgabe2_BusinessService` gibt es `@Transactional` nicht – dort fehlt Spring Data JPA, und es gibt nichts zu speichern.

## DTOs als Records

Das Service gibt nicht die Datenklassen nach außen, sondern ein **DTO** (*Data Transfer Object*) mit genau dem, was der Aufrufer braucht:

```java
public record FeeDto(String member, double euros, int openLoans) {
}
```

```java
public FeeDto feeFor(String memberName, LocalDate today) {
    List<Loan> loans = loanRepository.findByMemberName(memberName);
    if (loans.isEmpty()) {
        throw new MemberNotFoundException(memberName);
    }
    int cents = loans.stream().mapToInt(loan -> rules.fee(loan, today)).sum();
    long open = loans.stream().filter(loan -> loan.returned().isEmpty()).count();
    return new FeeDto(memberName, cents / 100.0, (int) open);
}
```

- Das Mapping (Datenklasse → DTO) steht an **einer** Stelle, im Service oder in einer statischen Methode `FeeDto.from(...)`.
- Der Controller in Aufgabe 3 gibt das DTO als JSON zurück. Interne Felder, etwa die ganze Liste der Ausleihen, verlassen das Service so nie.
- Euro als `double` ist hier nur zur Anzeige. Gerechnet wird weiter in Cent.

:::merke
- `@Service` + ein Konstruktor = Constructor Injection, Felder `final`.
- Jede Abhängigkeit braucht eine Bean, sonst startet der Kontext nicht.
- `@Transactional(readOnly = true)` an der Klasse, `@Transactional` an schreibenden Methoden (nur mit Spring Data JPA).
- Nach außen DTOs als Records, Mapping an einer Stelle.
:::
