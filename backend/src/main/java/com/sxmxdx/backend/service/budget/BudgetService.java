package com.sxmxdx.backend.service.budget;

import org.springframework.stereotype.Service;

import com.sxmxdx.backend.service.PipelineService;

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