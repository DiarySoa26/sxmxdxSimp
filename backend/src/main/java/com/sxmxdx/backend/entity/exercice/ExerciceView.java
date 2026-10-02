package com.sxmxdx.backend.entity.exercice;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "view_exercice")
public class ExerciceView {

    @Id
    @Column(name = "id_exercice")
    private Integer idExercice;

    @Column(name = "annee_exercice")
    private Integer anneeExercice;

    @Column(name = "id")
    private Integer idImportFichier;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "exercice_id")
    private Integer exerciceId;

    @Column(name = "statut")
    private String statut;

    @Column(name = "date_import")
    private LocalDateTime dateImport;

    @Column(name = "message_erreur")
    private String messageErreur;

    public ExerciceView() {
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