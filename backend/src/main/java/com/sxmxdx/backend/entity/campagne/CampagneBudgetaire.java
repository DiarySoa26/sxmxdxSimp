package com.sxmxdx.backend.entity.campagne;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "campagne_budgetaire")
public class CampagneBudgetaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(name = "exercice_id", nullable = false)
    private Long exerciceId;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false, length = 20)
    private String statut = "PLANIFIEE";

    @Column(name = "date_creation", insertable = false, updatable = false)
    private LocalDateTime dateCreation;

    public CampagneBudgetaire() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Long getExerciceId() { return exerciceId; }
    public void setExerciceId(Long exerciceId) { this.exerciceId = exerciceId; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }
}