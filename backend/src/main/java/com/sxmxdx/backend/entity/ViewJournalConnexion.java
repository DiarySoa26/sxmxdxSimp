
package com.sxmxdx.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "view_journal_connexion")
public class ViewJournalConnexion {

    @Id
    @Column(name = "journal_id")
    private Integer journalId;

    @Column(name = "utilisateur_id")
    private Integer utilisateurId;

    private String nom;
    private String prenom;
    private String email;
    private String role;

    @Column(name = "date_connexion")
    private LocalDateTime dateConnexion;

    private Boolean succes;

    public Integer getJournalId() { return journalId; }
    public Integer getUtilisateurId() { return utilisateurId; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public LocalDateTime getDateConnexion() { return dateConnexion; }
    public Boolean getSucces() { return succes; }
}
