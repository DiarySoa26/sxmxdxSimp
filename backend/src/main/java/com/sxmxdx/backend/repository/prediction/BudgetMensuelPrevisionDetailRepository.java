package com.sxmxdx.backend.repository.prediction;

import com.sxmxdx.backend.entity.prediction.BudgetMensuelPrevisionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetMensuelPrevisionDetailRepository
        extends JpaRepository<BudgetMensuelPrevisionDetail, Long> {

    List<BudgetMensuelPrevisionDetail>
        findByBudgetIdOrderByMoisIdAsc(Long budgetId);
}
