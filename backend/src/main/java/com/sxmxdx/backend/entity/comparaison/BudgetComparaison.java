// package com.sxmxdx.backend.entity.comparaison;

// import jakarta.persistence.*;
// import org.hibernate.annotations.Immutable;
// import java.math.BigDecimal;

// @Entity
// @Immutable
// @Table(name = "budget")
// public class BudgetComparaison {
//     @Id @Column(name = "id") private Long id;
//     @Column(name = "exercice_id") private Long exerciceId;
//     @Column(name = "import_id") private Long importId;
//     @Column(name = "ca_export") private BigDecimal caExport;
//     @Column(name = "charges_exploitation") private BigDecimal chargesExploitation;
//     @Column(name = "frais_export") private BigDecimal fraisExport;
//     @Column(name = "masse_salariale") private BigDecimal masseSalariale;
//     @Column(name = "resultat_operationnel") private BigDecimal resultatOperationnel;
//     @Column(name = "marge_operationnelle") private BigDecimal margeOperationnelle;
//     public Long getId(){return id;}
//     public Long getExerciceId(){return exerciceId;}
//     public Long getImportId(){return importId;}
//     public BigDecimal getCaExport(){return caExport;}
//     public BigDecimal getChargesExploitation(){return chargesExploitation;}
//     public BigDecimal getFraisExport(){return fraisExport;}
//     public BigDecimal getMasseSalariale(){return masseSalariale;}
//     public BigDecimal getResultatOperationnel(){return resultatOperationnel;}
//     public BigDecimal getMargeOperationnelle(){return margeOperationnelle;}
// }





package com.sxmxdx.backend.entity.comparaison;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "budget")
public class BudgetComparaison {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "exercice_id")
    private Long exerciceId;

    @Column(name = "import_id")
    private Long importId;

    @Column(name = "type_budget")
    private String typeBudget;

    @Column(name = "statut")
    private String statut;

    @Column(name = "ca_export")
    private BigDecimal caExport;

    @Column(name = "charges_exploitation")
    private BigDecimal chargesExploitation;

    @Column(name = "frais_export")
    private BigDecimal fraisExport;

    @Column(name = "masse_salariale")
    private BigDecimal masseSalariale;

    @Column(name = "resultat_operationnel")
    private BigDecimal resultatOperationnel;

    @Column(name = "marge_operationnelle")
    private BigDecimal margeOperationnelle;

    public Long getId() {
        return id;
    }

    public Long getExerciceId() {
        return exerciceId;
    }

    public Long getImportId() {
        return importId;
    }

    public String getTypeBudget() {
        return typeBudget;
    }

    public String getStatut() {
        return statut;
    }

    public BigDecimal getCaExport() {
        return caExport;
    }

    public BigDecimal getChargesExploitation() {
        return chargesExploitation;
    }

    public BigDecimal getFraisExport() {
        return fraisExport;
    }

    public BigDecimal getMasseSalariale() {
        return masseSalariale;
    }

    public BigDecimal getResultatOperationnel() {
        return resultatOperationnel;
    }

    public BigDecimal getMargeOperationnelle() {
        return margeOperationnelle;
    }
}
