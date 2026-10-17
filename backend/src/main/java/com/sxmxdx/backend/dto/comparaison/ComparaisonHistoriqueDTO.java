package com.sxmxdx.backend.dto.comparaison;

import java.util.List;

public record ComparaisonHistoriqueDTO(
    Integer annee1, 
    Integer annee2, 
    Long budgetId1, 
    Long budgetId2,
    List<IndicateurComparaisonDTO> indicateurs,
    List<String> interpretations
) {}
