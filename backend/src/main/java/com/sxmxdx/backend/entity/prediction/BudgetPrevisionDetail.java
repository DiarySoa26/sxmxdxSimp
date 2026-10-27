package com.sxmxdx.backend.entity.prediction;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budget")
public class BudgetPrevisionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exercice_id")
    private Long exerciceId;

    @Column(name = "type_budget")
    private String typeBudget;

    @Column(name = "amortissements")
    private BigDecimal amortissements;

    @Column(name = "charges_exploitation")
    private BigDecimal chargesExploitation;

    public Long getId() {
        return id;
    }

    public Long getExerciceId() {
        return exerciceId;
    }

    public String getTypeBudget() {
        return typeBudget;
    }

    public BigDecimal getAmortissements() {
        return amortissements;
    }

    public BigDecimal getChargesExploitation() {
        return chargesExploitation;
    }
}
