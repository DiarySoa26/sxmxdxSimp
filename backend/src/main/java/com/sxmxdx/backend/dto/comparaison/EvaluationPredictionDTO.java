
package com.sxmxdx.backend.dto.comparaison;

import java.util.List;

public class EvaluationPredictionDTO {

    private Integer annee;

    private Long budgetGenereId;
    private Long budgetPrevisionnelId;

    private List<IndicateurEvaluationDTO> indicateurs;
    private List<String> interpretations;

    public EvaluationPredictionDTO(
            Integer annee,
            Long budgetGenereId,
            Long budgetPrevisionnelId,
            List<IndicateurEvaluationDTO> indicateurs,
            List<String> interpretations
    ) {
        this.annee = annee;
        this.budgetGenereId = budgetGenereId;
        this.budgetPrevisionnelId = budgetPrevisionnelId;
        this.indicateurs = indicateurs;
        this.interpretations = interpretations;
    }

    public Integer getAnnee() {
        return annee;
    }

    public Long getBudgetGenereId() {
        return budgetGenereId;
    }

    public Long getBudgetPrevisionnelId() {
        return budgetPrevisionnelId;
    }

    public List<IndicateurEvaluationDTO> getIndicateurs() {
        return indicateurs;
    }

    public List<String> getInterpretations() {
        return interpretations;
    }
}
