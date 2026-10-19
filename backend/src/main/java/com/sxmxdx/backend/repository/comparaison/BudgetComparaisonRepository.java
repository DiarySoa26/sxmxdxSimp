package com.sxmxdx.backend.repository.comparaison;

import com.sxmxdx.backend.entity.comparaison.BudgetComparaison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BudgetComparaisonRepository extends JpaRepository<BudgetComparaison,Long> {
    // @Query("SELECT b FROM BudgetComparaison b WHERE b.exerciceId = :exerciceId ORDER BY b.id DESC")
    
    @Query("SELECT b FROM BudgetComparaison b WHERE b.exerciceId = :exerciceId and b.typeBudget = 'GENERE' ORDER BY b.id DESC")

    List<BudgetComparaison> findByExerciceId(@Param("exerciceId") Integer exerciceId);
}
