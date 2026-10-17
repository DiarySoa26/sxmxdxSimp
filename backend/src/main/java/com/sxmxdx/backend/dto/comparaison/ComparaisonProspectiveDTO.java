
// package com.sxmxdx.backend.dto.comparaison;

// import java.util.List;

// public class ComparaisonProspectiveDTO{
//     Integer anneeBudget;
//     Integer anneePrevision;
//     Long budgetId;
//     Long previsionId;
//     List<IndicateurComparaisonDTO> indicateurs;
//     List<String> interpretations;

//     public ComparaisonProspectiveDTO(Integer anneeBudget,
//     Integer anneePrevision,
//     Long budgetId,
//     Long previsionId,
//     List<IndicateurComparaisonDTO> indicateurs,
//     List<String> interpretations){
//         this.anneeBudget = anneeBudget;
//         this.anneePrevision = anneePrevision;
//         this.budgetId =budgetId;
//         this.previsionId = previsionId;
//         this.indicateurs = indicateurs;
//         this.interpretations = interpretations;
        
//     }
// }



package com.sxmxdx.backend.dto.comparaison;

import java.util.List;

public record ComparaisonProspectiveDTO(
    Integer anneeBudget,
    Integer anneePrevision,
    Long budgetId,
    Long previsionId,
    List<IndicateurComparaisonDTO> indicateurs,
    List<String> interpretations
) {}