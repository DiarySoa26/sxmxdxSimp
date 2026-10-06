package com.sxmxdx.backend.service.prediction;

import com.sxmxdx.backend.repository.prediction.PredictionRepository;
import com.sxmxdx.backend.service.PipelineService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    private final PipelineService pipelineService;
    private final PredictionRepository predictionRepository;

    public PredictionService(
            PipelineService pipelineService,
            PredictionRepository predictionRepository
    ) {
        this.pipelineService = pipelineService;
        this.predictionRepository = predictionRepository;
    }

    public Map<?, ?> genererPrediction() {
        System.out.println("[PREDICTION] Appel du pipeline Flask...");

        Map<?, ?> resultat = pipelineService.genererPrediction();

        System.out.println("[PREDICTION] Réponse du pipeline reçue.");

        return resultat;
    }

    public Map<String, Object> lastPrediction() {
        Map<String, Object> prediction =
                predictionRepository.rechercherDernierePrediction();

        if (prediction == null) {
            return null;
        }

        Long budgetId =
                ((Number) prediction.get("id")).longValue();

        List<Map<String, Object>> mois =
                predictionRepository.rechercherMois(budgetId);

        Map<String, Object> resultat =
                new LinkedHashMap<>(prediction);

        resultat.put("mois", mois);

        return resultat;
    }
}