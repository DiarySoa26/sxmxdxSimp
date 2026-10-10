// package com.sxmxdx.backend.entity.campagne;

// import jakarta.persistence.*;
// import lombok.*;
// import java.time.LocalDate;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "campagne_budgetaire")
// @Getter @Setter
// @NoArgsConstructor
// public class CampagneBudgetaire {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(nullable = false)
//     private String nom;

//     @Column(name = "exercice_id", nullable = false)
//     private Long exerciceId;

//     @Column(name = "date_debut", nullable = false)
//     private LocalDate dateDebut;

//     @Column(name = "date_fin", nullable = false)
//     private LocalDate dateFin;

//     @Column(nullable = false)
//     private String statut = "PLANIFIEE";

//     @Column(name = "date_creation",
//             insertable = false, updatable = false)
//     private LocalDateTime dateCreation;
// }