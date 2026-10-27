package com.sxmxdx.backend.repository.prediction;

import com.sxmxdx.backend.entity.prediction.BudgetPrevisionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface BudgetPrevisionDetailRepository
        extends JpaRepository<BudgetPrevisionDetail, Long> {

    @Query(value = """
        SELECT b.*
        FROM budget b
        JOIN exercice e ON e.id = b.exercice_id
        WHERE e.annee = :annee
          AND b.type_budget = 'PREVISIONNEL'
        ORDER BY b.id DESC
        LIMIT 1
        """, nativeQuery = true)
    Optional<BudgetPrevisionDetail> dernierBudget(
        @Param("annee") Integer annee
    );
}
