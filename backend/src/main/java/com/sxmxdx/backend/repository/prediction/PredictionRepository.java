package com.sxmxdx.backend.repository.prediction;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PredictionRepository {

    private final JdbcTemplate jdbcTemplate;

    public PredictionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> rechercherDernierePrediction() {
        List<Map<String, Object>> resultats = jdbcTemplate.queryForList("""
            SELECT
                b.id,
                e.annee,
                b.annee_reference,
                b.type_budget,
                b.statut,
                b.modele,
                b.version_modele,
                b.ca_export,
                b.charges_exploitation,
                b.frais_export,
                b.masse_salariale,
                b.resultat_operationnel,
                b.marge_operationnelle,
                b.date_generation,
                pa.resume
            FROM budget b
            JOIN exercice e ON e.id = b.exercice_id
            LEFT JOIN prediction_analyse pa ON pa.budget_id = b.id
            WHERE b.type_budget = 'PREVISIONNEL'
            ORDER BY b.id DESC
            LIMIT 1
        """);

        return resultats.isEmpty() ? null : resultats.get(0);
    }

    public List<Map<String, Object>> rechercherMois(Long budgetId) {
        return jdbcTemplate.queryForList("""
            SELECT
                bm.mois_id,
                m.nom AS mois,
                bm.ventes,
                bm.production,
                bm.ca_export,
                bm.charges_exploitation,
                bm.frais_export,
                bm.masse_salariale,
                bm.resultat_operationnel,
                bm.marge_operationnelle
            FROM budget_mensuel bm
            JOIN mois m ON m.id = bm.mois_id
            WHERE bm.budget_id = ?
            ORDER BY bm.mois_id
        """, budgetId);
    }
}