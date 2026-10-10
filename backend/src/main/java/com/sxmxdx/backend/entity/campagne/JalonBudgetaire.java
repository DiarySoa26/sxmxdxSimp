// package com.sxmxdx.backend.entity.campagne;

// import jakarta.persistence.*;
// import lombok.*;
// import java.time.LocalDate;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "jalon_budgetaire")
// @Getter @Setter
// @NoArgsConstructor
// public class JalonBudgetaire {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(name = "campagne_id", nullable = false)
//     private Long campagneId;

//     @Column(nullable = false)
//     private String nom;

//     @Column(nullable = false)
//     private String code;

//     @Column(nullable = false)
//     private Integer ordre;

//     @Column(name = "date_limite", nullable = false)
//     private LocalDate dateLimite;

//     @Column(name = "date_realisation")
//     private LocalDateTime dateRealisation;

//     @Column(nullable = false)
//     private String statut = "EN_ATTENTE";
// }