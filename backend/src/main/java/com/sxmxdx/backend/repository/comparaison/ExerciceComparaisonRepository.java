package com.sxmxdx.backend.repository.comparaison;

import com.sxmxdx.backend.entity.comparaison.ExerciceComparaison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ExerciceComparaisonRepository extends JpaRepository<ExerciceComparaison,Long> {
    Optional<ExerciceComparaison> findByAnnee(Integer annee);
    @Query("SELECT DISTINCT e.annee FROM ExerciceComparaison e, BudgetComparaison b WHERE b.exerciceId = e.id ORDER BY e.annee DESC")
    List<Integer> anneesAvecBudget();
}
