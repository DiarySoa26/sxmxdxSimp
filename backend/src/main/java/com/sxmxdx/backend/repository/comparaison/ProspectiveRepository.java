
package com.sxmxdx.backend.repository.comparaison;

import com.sxmxdx.backend.entity.comparaison.BudgetComparaison;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProspectiveRepository
        extends JpaRepository<BudgetComparaison, Long> {

    @Query(value = """
        SELECT b.*
        FROM budget b
        JOIN exercice e ON b.exercice_id = e.id
        WHERE e.annee = :annee
          AND b.type_budget = :type
          AND b.statut = 'GENERE'
        ORDER BY b.date_generation DESC, b.id DESC
        """, nativeQuery = true)
    List<BudgetComparaison> byAnneeAndType(
        @Param("annee") Integer annee,
        @Param("type") String type
    );

    @Query(value = """
        SELECT DISTINCT e.annee
        FROM budget b
        JOIN exercice e ON b.exercice_id = e.id
        WHERE b.type_budget = :type
          AND b.statut = 'GENERE'
        ORDER BY e.annee DESC
        """, nativeQuery = true)
    List<Integer> anneesByType(
        @Param("type") String type
    );
}
