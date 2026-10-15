
package com.sxmxdx.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "view_journal_audit")
public class ViewJournalAudit {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "utilisateur_id")
    private Integer utilisateurId;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "email")
    private String email;

    @Column(name = "role")
    private String role;

    @Column(name = "action")
    private String action;

    @Column(name = "module")
    private String module;

    @Column(name = "description")
    private String description;

    @Column(name = "entite_type")
    private String entiteType;

    @Column(name = "entite_id")
    private String entiteId;

    @Column(name = "statut")
    private String statut;

    @Column(name = "date_action")
    private LocalDateTime dateAction;

    public Long getId() {
        return id;
    }

    public Integer getUtilisateurId() {
        return utilisateurId;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getAction() {
        return action;
    }

    public String getModule() {
        return module;
    }

    public String getDescription() {
        return description;
    }

    public String getEntiteType() {
        return entiteType;
    }

    public String getEntiteId() {
        return entiteId;
    }

    public String getStatut() {
        return statut;
    }

    public LocalDateTime getDateAction() {
        return dateAction;
    }
}
