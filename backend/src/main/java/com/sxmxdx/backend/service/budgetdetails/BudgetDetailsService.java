// package com.sxmxdx.backend.service.budgetdetails;

// import com.sxmxdx.backend.repository.budgetdetails.BudgetDetailsRepository;

// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.Map;

// @Service
// public class BudgetDetailsService {

//     private final BudgetDetailsRepository repository;

//     public BudgetDetailsService(
//             BudgetDetailsRepository repository
//     ) {
//         this.repository = repository;
//     }


//     public List<Map<String, Object>> getCharges(
//             Integer exerciceId
//     ) {
//         return repository.getCharges(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getExportations(
//             Integer exerciceId
//     ) {
//         return repository.getExportations(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getFraisExport(
//             Integer exerciceId
//     ) {
//         return repository.getFraisExport(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getProduction(
//             Integer exerciceId
//     ) {
//         return repository.getProduction(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getEmployes(
//             Integer exerciceId
//     ) {
//         return repository.getEmployes(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getBudget(
//             Integer exerciceId
//     ) {
//         return repository.getBudget(
//                 exerciceId
//         );
//     }


//     public List<Map<String, Object>> getBudgetM(
//             Integer budgetId
//     ) {
//         return repository.getBudgetM(
//                 budgetId
//         );
//     }
// }





package com.sxmxdx.backend.service.budgetdetails;

import com.sxmxdx.backend.repository.budgetdetails.BudgetDetailsRepository;
import com.sxmxdx.backend.service.JournalAuditService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BudgetDetailsService {

    private final BudgetDetailsRepository repository;
    private final JournalAuditService journalAuditService;

    public BudgetDetailsService(
            BudgetDetailsRepository repository,
            JournalAuditService journalAuditService
    ) {
        this.repository = repository;
        this.journalAuditService = journalAuditService;
    }

    private void enregistrerConsultation(
            Integer auteurId,
            String type,
            Integer entiteId
    ) {
        try {
            journalAuditService.enregistrer(
                    auteurId,
                    "CONSULTATION_" + type,
                    "CONSULTATION",
                    "Consultation " + type,
                    type,
                    String.valueOf(entiteId),
                    "SUCCES"
            );
        } catch (Exception e) {
            System.err.println("[AUDIT] " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getCharges(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getCharges(exerciceId);
        enregistrerConsultation(auteurId, "CHARGES", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getExportations(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getExportations(exerciceId);
        enregistrerConsultation(auteurId, "EXPORTATIONS", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getFraisExport(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getFraisExport(exerciceId);
        enregistrerConsultation(auteurId, "FRAIS_EXPORT", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getProduction(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getProduction(exerciceId);
        enregistrerConsultation(auteurId, "PRODUCTION", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getEmployes(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getEmployes(exerciceId);
        enregistrerConsultation(auteurId, "EMPLOYES", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getBudget(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getBudget(exerciceId);
        enregistrerConsultation(auteurId, "BUDGET", exerciceId);
        return resultat;
    }

    public List<Map<String, Object>> getBudgetM(
            Integer budgetId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat = repository.getBudgetM(budgetId);
        enregistrerConsultation(auteurId, "BUDGET_MENSUEL", budgetId);
        return resultat;
    }
}
