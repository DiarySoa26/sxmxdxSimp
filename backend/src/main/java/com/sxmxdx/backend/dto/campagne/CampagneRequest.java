// package com.sxmxdx.backend.dto.campagne;

// import java.time.LocalDate;

// public class CampagneRequest {

//     private String nom;
//     private Long exerciceId;
//     private LocalDate dateDebut;
//     private LocalDate dateFin;
//     private LocalDate dateImportation;
//     private LocalDate dateGeneration;
//     private LocalDate dateVerification;
//     private LocalDate dateCloture;

//     public CampagneRequest() {}

//     public String getNom() { return nom; }
//     public void setNom(String nom) { this.nom = nom; }

//     public Long getExerciceId() { return exerciceId; }
//     public void setExerciceId(Long exerciceId) { this.exerciceId = exerciceId; }

//     public LocalDate getDateDebut() { return dateDebut; }
//     public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

//     public LocalDate getDateFin() { return dateFin; }
//     public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

//     public LocalDate getDateImportation() { return dateImportation; }
//     public void setDateImportation(LocalDate dateImportation) {
//         this.dateImportation = dateImportation;
//     }

//     public LocalDate getDateGeneration() { return dateGeneration; }
//     public void setDateGeneration(LocalDate dateGeneration) {
//         this.dateGeneration = dateGeneration;
//     }

//     public LocalDate getDateVerification() { return dateVerification; }
//     public void setDateVerification(LocalDate dateVerification) {
//         this.dateVerification = dateVerification;
//     }

//     public LocalDate getDateCloture() { return dateCloture; }
//     public void setDateCloture(LocalDate dateCloture) {
//         this.dateCloture = dateCloture;
//     }
// }



package com.sxmxdx.backend.dto.campagne;

import java.time.LocalDate;

public class CampagneRequest {
    private String nom;
    private Long exerciceId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private LocalDate dateImportation;
    private LocalDate dateGeneration;
    private LocalDate dateVerification;
    private LocalDate dateValidation;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Long getExerciceId() { return exerciceId; }
    public void setExerciceId(Long exerciceId) { this.exerciceId = exerciceId; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate v) { this.dateDebut = v; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate v) { this.dateFin = v; }

    public LocalDate getDateImportation() { return dateImportation; }
    public void setDateImportation(LocalDate v) { this.dateImportation = v; }

    public LocalDate getDateGeneration() { return dateGeneration; }
    public void setDateGeneration(LocalDate v) { this.dateGeneration = v; }

    public LocalDate getDateVerification() { return dateVerification; }
    public void setDateVerification(LocalDate v) { this.dateVerification = v; }

    public LocalDate getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDate v) { this.dateValidation = v; }
}