package com.sxmxdx.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "journal_connexion")
public class JournalConnexion {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Integer id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "utilisateur_id"
    )
    private Utilisateur utilisateur;


    @Column(
        name = "date_connexion",
        nullable = false
    )
    private LocalDateTime dateConnexion;


    @Column(
        name = "succes",
        nullable = false
    )
    private Boolean succes;


    public JournalConnexion() {
    }


    @PrePersist
    public void avantInsertion() {

        if (dateConnexion == null) {
            dateConnexion =
                LocalDateTime.now();
        }
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }


    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(
        Utilisateur utilisateur
    ) {
        this.utilisateur = utilisateur;
    }


    public LocalDateTime getDateConnexion() {
        return dateConnexion;
    }

    public void setDateConnexion(
        LocalDateTime dateConnexion
    ) {
        this.dateConnexion =
            dateConnexion;
    }


    public Boolean getSucces() {
        return succes;
    }

    public void setSucces(Boolean succes) {
        this.succes = succes;
    }
}