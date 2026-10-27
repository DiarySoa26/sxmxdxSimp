package com.sxmxdx.backend.repository.prediction;

import com.sxmxdx.backend.entity.prediction.PredictionChargeCategorie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionChargeCategorieRepository
        extends JpaRepository<PredictionChargeCategorie, Long> {

    List<PredictionChargeCategorie>
        findByBudgetIdOrderByMoisIdAscCategorieAsc(
            Long budgetId
        );
}
