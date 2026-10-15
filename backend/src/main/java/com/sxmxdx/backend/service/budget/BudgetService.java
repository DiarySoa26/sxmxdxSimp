// package com.sxmxdx.backend.service.budget;

// import org.springframework.stereotype.Service;

// import com.sxmxdx.backend.service.PipelineService;

// import java.util.Map;

// @Service
// public class BudgetService {

//     private final PipelineService pipelineService;

//     public BudgetService(
//             PipelineService pipelineService
//     ) {
//         this.pipelineService = pipelineService;
//     }

//     public Map<?, ?> genererBudget() {

//         System.out.println(
//                 "[BUDGET] Appel du pipeline Flask..."
//         );

//         Map<?, ?> resultat =
//                 pipelineService.genererBudget();

//         System.out.println(
//                 "[BUDGET] Réponse du pipeline : "
//                         + resultat
//         );

//         return resultat;
//     }
// }





package com.sxmxdx.backend.service.budget;

import org.springframework.stereotype.Service;

import com.sxmxdx.backend.service.PipelineService;
import com.sxmxdx.backend.service.JournalAuditService;

import java.util.Map;

@Service
public class BudgetService {

    private final PipelineService pipelineService;
    private final JournalAuditService journalAuditService;

    public BudgetService(
            PipelineService pipelineService,
            JournalAuditService journalAuditService
    ) {
        this.pipelineService = pipelineService;
        this.journalAuditService = journalAuditService;
    }

    public Map<?, ?> genererBudget(Integer auteurId) {

        System.out.println("[BUDGET] Appel du pipeline Flask...");

        try {
            Map<?, ?> resultat = pipelineService.genererBudget();

            System.out.println("[BUDGET] Réponse du pipeline : " + resultat);

            boolean succes = resultat != null
                    && Boolean.TRUE.equals(resultat.get("success"));

            enregistrerAudit(
                    auteurId,
                    succes ? "GENERATION_BUDGET" : "ECHEC_GENERATION_BUDGET",
                    succes ? "Génération du budget réussie."
                           : "Échec de génération du budget.",
                    succes ? "SUCCES" : "ECHEC"
            );

            return resultat;

        } catch (RuntimeException e) {
            enregistrerAudit(
                    auteurId,
                    "ECHEC_GENERATION_BUDGET",
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
                    "BUDGET",
                    description,
                    "BUDGET",
                    null,
                    statut
            );
        } catch (Exception e) {
            System.err.println("[AUDIT] " + e.getMessage());
        }
    }
}
