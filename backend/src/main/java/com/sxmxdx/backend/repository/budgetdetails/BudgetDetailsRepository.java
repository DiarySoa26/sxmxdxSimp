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


    public List<Map<String, Object>> getBudget(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM budget
                WHERE exercice_id = :exerciceId
                AND type_budget = 'GENERE'
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


    public List<Map<String, Object>> getAmortissements(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT *
                FROM view_amortissement_mois
                WHERE exercice_id = :exerciceId
                ORDER BY mois ASC, id ASC
                """,
                exerciceId
        );
    }


    public List<Map<String, Object>> getAmortissementsTotaux(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT
                    mois,
                    nom_mois,
                    SUM(montant) AS total_amortissement
                FROM view_amortissement_mois
                WHERE exercice_id = :exerciceId
                GROUP BY mois, nom_mois
                ORDER BY mois ASC
                """,
                exerciceId
        );
    }

    public List<Map<String, Object>> getAmortissementsAnnuel(
            Integer exerciceId
    ) {

        return executer(
                """
                SELECT
                    COALESCE(
                        SUM(montant), 0
                    ) AS total_annuel
                FROM view_amortissement_mois
                WHERE exercice_id = :exerciceId
                """,
                exerciceId
        );
    }

//     public List<Map<String, Object>> getCRAmortissements(
//             Integer exerciceId
//     ) {
//         return executer(
//                 """
//                 SELECT
//                     mois,
//                     COALESCE(SUM(montant), 0)
//                         AS amortissements
//                 FROM view_amortissement_mois
//                 WHERE exercice_id = :exerciceId
//                 GROUP BY mois
//                 ORDER BY mois
//                 """,
//                 exerciceId
//         );
//     }



    // =====================================================
    // COMPTE DE RESULTAT - AMORTISSEMENTS
    // =====================================================

    public List<Map<String, Object>> getAmortissementsPourCR(
            Integer exerciceId
    ) {
        return executer(
                """
                SELECT
                    mois,
                    COALESCE(SUM(montant), 0) AS montant
                FROM amortissement_mensuel
                WHERE exercice_id = :exerciceId
                GROUP BY mois
                ORDER BY mois ASC
                """,
                exerciceId
        );
    }

    // =====================================================
    // COMPTE DE RESULTAT - BUDGET MENSUEL
    // =====================================================

    public List<Map<String, Object>> getBudgetMensuelPourCR(
            Integer exerciceId
    ) {
        return executer(
                """
                SELECT bm.*
                FROM view_budget_mensuel_mois bm
                JOIN budget b ON b.id = bm.budget_id
                WHERE b.exercice_id = :exerciceId
                  AND b.type_budget = 'GENERE'
                  AND b.id = (
                      SELECT MAX(b2.id)
                      FROM budget b2
                      WHERE b2.exercice_id = :exerciceId
                        AND b2.type_budget = 'GENERE'
                  )
                ORDER BY bm.mois_id ASC
                """,
                exerciceId
        );
    }

    

}