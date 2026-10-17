package com.sxmxdx.backend.dto.comparaison;

import java.math.BigDecimal;

public record IndicateurComparaisonDTO(
    String code, 
    String libelle, 
    String unite,
    BigDecimal valeur1, 
    BigDecimal valeur2, 
    BigDecimal ecart,
    BigDecimal evolutionPourcentage, 
    String tendance
) {}
