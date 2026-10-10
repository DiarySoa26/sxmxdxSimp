package com.sxmxdx.backend.dto.exercice;

import java.time.LocalDateTime;

public class ExerciceDTO {

    private Integer idExercice;
    private Integer anneeExercice;

    private Integer idImportFichier;
    private String nomFichier;

    private Integer exerciceId;
    private String statut;

    private LocalDateTime dateImport;
    private String messageErreur;

    public ExerciceDTO() {
    }

    public Integer getIdExercice() {
        return idExercice;
    }

    public void setIdExercice(Integer idExercice) {
        this.idExercice = idExercice;
    }

    public Integer getAnneeExercice() {
        return anneeExercice;
    }

    public void setAnneeExercice(Integer anneeExercice) {
        this.anneeExercice = anneeExercice;
    }

    public Integer getIdImportFichier() {
        return idImportFichier;
    }

    public void setIdImportFichier(Integer idImportFichier) {
        this.idImportFichier = idImportFichier;
    }

    public String getNomFichier() {
        return nomFichier;
    }

    public void setNomFichier(String nomFichier) {
        this.nomFichier = nomFichier;
    }

    public Integer getExerciceId() {
        return exerciceId;
    }

    public void setExerciceId(Integer exerciceId) {
        this.exerciceId = exerciceId;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateImport() {
        return dateImport;
    }

    public void setDateImport(LocalDateTime dateImport) {
        this.dateImport = dateImport;
    }

    public String getMessageErreur() {
        return messageErreur;
    }

    public void setMessageErreur(String messageErreur) {
        this.messageErreur = messageErreur;
    }
}