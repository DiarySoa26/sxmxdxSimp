
// package com.sxmxdx.backend.entity;

// import jakarta.persistence.*;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "view_journal_audit")
// public class JournalAudit {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     private String nom;
//     private String prenom;

//     @Column(name = "utilisateur_id")
//     private Integer utilisateurId;

//     private String action;
//     private String module;
//     private String description;

//     @Column(name = "entite_type")
//     private String entiteType;

//     @Column(name = "entite_id")
//     private String entiteId;

//     private String statut;

//     @Column(name = "date_action")
//     private LocalDateTime dateAction;

//     @PrePersist
//     public void avantInsertion() {
//         if (dateAction == null) dateAction = LocalDateTime.now();
//     }

//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }

//     public String getNom() { return nom; }
//     public void setNom(String nom) { this.nom = nom; }

//     public String getPrenom() { return prenom; }
//     public void setPrenom(String prenom) { this.prenom = prenom; }

//     public Integer getUtilisateurId() { return utilisateurId; }
//     public void setUtilisateurId(Integer v) { utilisateurId = v; }

//     public String getAction() { return action; }
//     public void setAction(String v) { action = v; }

//     public String getModule() { return module; }
//     public void setModule(String v) { module = v; }

//     public String getDescription() { return description; }
//     public void setDescription(String v) { description = v; }

//     public String getEntiteType() { return entiteType; }
//     public void setEntiteType(String v) { entiteType = v; }

//     public String getEntiteId() { return entiteId; }
//     public void setEntiteId(String v) { entiteId = v; }

//     public String getStatut() { return statut; }
//     public void setStatut(String v) { statut = v; }

//     public LocalDateTime getDateAction() { return dateAction; }
//     public void setDateAction(LocalDateTime v) { dateAction = v; }


// }






package com.sxmxdx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_audit")
public class JournalAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id")
    private Integer utilisateurId;

    private String action;
    private String module;
    private String description;

    @Column(name = "entite_type")
    private String entiteType;

    @Column(name = "entite_id")
    private String entiteId;

    private String statut;

    @Column(name = "date_action")
    private LocalDateTime dateAction;

    @PrePersist
    public void avantInsertion() {
        if (dateAction == null) dateAction = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Integer v) { utilisateurId = v; }

    public String getAction() { return action; }
    public void setAction(String v) { action = v; }

    public String getModule() { return module; }
    public void setModule(String v) { module = v; }

    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }

    public String getEntiteType() { return entiteType; }
    public void setEntiteType(String v) { entiteType = v; }

    public String getEntiteId() { return entiteId; }
    public void setEntiteId(String v) { entiteId = v; }

    public String getStatut() { return statut; }
    public void setStatut(String v) { statut = v; }

    public LocalDateTime getDateAction() { return dateAction; }
    public void setDateAction(LocalDateTime v) { dateAction = v; }


}
