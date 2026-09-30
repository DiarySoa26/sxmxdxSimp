package com.sxmxdx.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
public class Utilisateur {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Integer id;


    @Column(
        name = "nom",
        nullable = false,
        length = 100
    )
    private String nom;


    @Column(
        name = "prenom",
        length = 100
    )
    private String prenom;


    @Column(
        name = "email",
        nullable = false,
        unique = true,
        length = 150
    )
    private String email;


    @Column(
        name = "mot_de_passe",
        nullable = false,
        length = 255
    )
    private String motDePasse;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "role_id",
        nullable = false
    )
    private Role role;


    @Column(
        name = "actif",
        nullable = false
    )
    private Boolean actif;


    @Column(
        name = "date_creation",
        nullable = false
    )
    private LocalDateTime dateCreation;


    @Column(
        name = "derniere_connexion"
    )
    private LocalDateTime derniereConnexion;


    public Utilisateur() {
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }


    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }


    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(
        String motDePasse
    ) {
        this.motDePasse = motDePasse;
    }


    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }


    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(
        LocalDateTime dateCreation
    ) {
        this.dateCreation = dateCreation;
    }


    public LocalDateTime getDerniereConnexion() {
        return derniereConnexion;
    }

    public void setDerniereConnexion(
        LocalDateTime derniereConnexion
    ) {
        this.derniereConnexion =
            derniereConnexion;
    }
}