package com.sxmxdx.backend.entity.prediction;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budget_mensuel")
public class BudgetMensuelPrevisionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "budget_id")
    private Long budgetId;

    @Column(name = "mois_id")
    private Integer moisId;

    @Column(name = "amortissements")
    private BigDecimal amortissements;

    public Long getId() {
        return id;
    }

    public Long getBudgetId() {
        return budgetId;
    }

    public Integer getMoisId() {
        return moisId;
    }

    public BigDecimal getAmortissements() {
        return amortissements;
    }
}
