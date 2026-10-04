package com.sxmxdx.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class BudgetService {

    private final PipelineService pipelineService;

    public BudgetService(
            PipelineService pipelineService
    ) {
        this.pipelineService = pipelineService;
    }

    public Map<?, ?> genererBudget() {

        System.out.println(
                "[BUDGET] Appel du pipeline Flask..."
        );

        Map<?, ?> resultat =
                pipelineService.genererBudget();

        System.out.println(
                "[BUDGET] Réponse du pipeline : "
                        + resultat
        );

        return resultat;
    }
}