package com.sxmxdx.backend.repository.budgetdetails;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class BudgetDetailsRepository {

    @PersistenceContext
    private EntityManager entityManager;


    // =====================================================
    // METHODE GENERIQUE
    // =====================================================

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> executer(
            String sql,
            Integer exerciceId
    ) {

        return entityManager
                .createNativeQuery(
                        sql,
                        jakarta.persistence.Tuple.class
                )
                .setParameter(
                        "exerciceId",
                        exerciceId
                )
                .getResultList()
                .stream()
                .map(result -> {

                    jakarta.persistence.Tuple tuple =
                            (jakarta.persistence.Tuple) result;

                    Map<String, Object> ligne =
                            new java.util.LinkedHashMap<>();

                    tuple.getElements()
                            .forEach(element -> {

                                String nom =
                                        element.getAlias();

                                ligne.put(
                                        nom,
                                        tuple.get(nom)
                                );

                            });

                    return ligne;

                })
                .toList();
    }


    // =====================================================
    // CHARGES
    // =====================================================

    public List<Map<String, Object>> getCharges(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_charges_mois
                WHERE exercice_id = :exerciceId
                ORDER BY mois_id ASC, id ASC
                """,
                exerciceId
        );
    }


    // =====================================================
    // EXPORTATIONS
    // =====================================================

    public List<Map<String, Object>> getExportations(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_exportations_mois
                WHERE exercice_id = :exerciceId
                ORDER BY mois_id ASC, id ASC
                """,
                exerciceId
        );
    }


    // =====================================================
    // FRAIS EXPORT
    // =====================================================

    public List<Map<String, Object>> getFraisExport(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_frais_export_mois
                WHERE exercice_id = :exerciceId
                ORDER BY mois_id ASC, id ASC
                """,
                exerciceId
        );
    }


    // =====================================================
    // PRODUCTION
    // =====================================================

    public List<Map<String, Object>> getProduction(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_production_mois
                WHERE exercice_id = :exerciceId
                ORDER BY mois_id ASC, id ASC
                """,
                exerciceId
        );
    }


    // =====================================================
    // EMPLOYES
    // =====================================================

    public List<Map<String, Object>> getEmployes(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT employe.*
                FROM employe
                JOIN view_exercice as ve ON ve.id = employe.import_id
                WHERE exercice_id = :exerciceId
                ORDER BY id ASC
                """,
                exerciceId
        );
    }


    // =====================================================
    // BUDGET
    // =====================================================

    public List<Map<String, Object>> getBudget(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM budget
                WHERE exercice_id = :exerciceId
                ORDER BY id DESC
                """,
                exerciceId
        );
    }

    public List<Map<String, Object>> getBudgetM(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_budget_mensuel_mois
                WHERE budget_id = :exerciceId
                ORDER BY id ASC
                """,
                exerciceId
        );
    }
}