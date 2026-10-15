package com.sxmxdx.backend.service.prediction;

import com.sxmxdx.backend.repository.prediction.PredictionRepository;
import com.sxmxdx.backend.service.PipelineService;
import com.sxmxdx.backend.service.JournalAuditService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    private final PipelineService pipelineService;
    private final PredictionRepository predictionRepository;
    private final JournalAuditService journalAuditService;

    public PredictionService(
            PipelineService pipelineService,
            PredictionRepository predictionRepository,
            JournalAuditService journalAuditService
    ) {
        this.pipelineService = pipelineService;
        this.predictionRepository = predictionRepository;
        this.journalAuditService = journalAuditService;
    }

    public Map<?, ?> genererPrediction(Integer auteurId) {
        System.out.println("[PREDICTION] Appel du pipeline Flask...");

        try {
            Map<?, ?> resultat = pipelineService.genererPrediction();

            System.out.println("[PREDICTION] Réponse : " + resultat);

            boolean succes = resultat != null
                    && Boolean.TRUE.equals(resultat.get("success"));

            enregistrerAudit(
                    auteurId,
                    succes ? "GENERATION_PREDICTION" : "ECHEC_GENERATION_PREDICTION",
                    succes ? "Génération des prédictions réussie."
                           : "Échec de génération des prédictions.",
                    succes ? "SUCCES" : "ECHEC"
            );

            return resultat;

        } catch (RuntimeException e) {
            enregistrerAudit(
                    auteurId,
                    "ECHEC_GENERATION_PREDICTION",
                    "Erreur : " + e.getMessage(),
                    "ECHEC"
            );
            throw e;
        }
    }

    private void enregistrerAudit(
            Integer auteurId,
            String action,
            String description,
            String statut
    ) {
        try {
            journalAuditService.enregistrer(
                    auteurId,
                    action,
                    "PREDICTION",
                    description,
                    "PREDICTION",
                    null,
                    statut
            );
        } catch (Exception e) {
            System.err.println("[AUDIT] " + e.getMessage());
        }
    }

    public Map<String, Object> lastPrediction() {
        Map<String, Object> prediction =
                predictionRepository.rechercherDernierePrediction();

        if (prediction == null) return null;

        Long budgetId = ((Number) prediction.get("id")).longValue();

        Map<String, Object> resultat = new LinkedHashMap<>(prediction);
        resultat.put("mois", predictionRepository.rechercherMois(budgetId));

        return resultat;
    }

    public List<Map<String, Object>> listerPredictions() {
        return predictionRepository.rechercherPredictions();
    }

    public Map<String, Object> rechercherPrediction(Long id) {
        Map<String, Object> prediction =
                predictionRepository.rechercherPrediction(id);

        if (prediction == null) return null;

        Map<String, Object> resultat = new LinkedHashMap<>(prediction);
        resultat.put("mois", predictionRepository.rechercherMois(id));

        return resultat;
    }
}
