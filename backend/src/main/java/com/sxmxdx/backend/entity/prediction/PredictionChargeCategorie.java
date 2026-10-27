package com.sxmxdx.backend.entity.prediction;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "prediction_charge_categorie")
public class PredictionChargeCategorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "budget_id", nullable = false)
    private Long budgetId;

    @Column(name = "mois_id", nullable = false)
    private Integer moisId;

    @Column(name = "categorie", nullable = false)
    private String categorie;

    @Column(name = "montant_prevu", nullable = false)
    private BigDecimal montantPrevu;

    public Long getId() {
        return id;
    }

    public Long getBudgetId() {
        return budgetId;
    }

    public Integer getMoisId() {
        return moisId;
    }

    public String getCategorie() {
        return categorie;
    }

    public BigDecimal getMontantPrevu() {
        return montantPrevu;
    }
}
