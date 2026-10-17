
package com.sxmxdx.backend.repository.comparaison;

import com.sxmxdx.backend.entity.comparaison.BudgetComparaison;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EvaluationPredictionRepository
        extends JpaRepository<BudgetComparaison, Long> {

    @Query("""
        SELECT b
        FROM BudgetComparaison b
        WHERE b.exerciceId = :exerciceId
          AND b.typeBudget = :type
        ORDER BY b.id DESC
        """)
    List<BudgetComparaison> findByExerciceAndType(
            @Param("exerciceId") Integer exerciceId,
            @Param("type") String type
    );

    @Query("""
        SELECT DISTINCT e.annee
        FROM ExerciceComparaison e
        WHERE EXISTS (
            SELECT b.id
            FROM BudgetComparaison b
            WHERE b.exerciceId = e.id
              AND b.typeBudget = 'GENERE'
        )
        AND EXISTS (
            SELECT p.id
            FROM BudgetComparaison p
            WHERE p.exerciceId = e.id
              AND p.typeBudget = 'PREVISIONNEL'
        )
        ORDER BY e.annee
        """)
    List<Integer> findAnneesEvaluables();
}
