package com.sxmxdx.backend.service.budgetdetails;

import com.sxmxdx.backend.repository.budgetdetails.BudgetDetailsRepository;
import com.sxmxdx.backend.service.JournalAuditService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetDetailsService {

    private final BudgetDetailsRepository repository;
    private final JournalAuditService journalAuditService;
    private final CompteResultatCalculService compteResultatCalculService;


//     public BudgetDetailsService(
//             BudgetDetailsRepository repository,
//             JournalAuditService journalAuditService
//     ) {
//         this.repository = repository;
//         this.journalAuditService = journalAuditService;
//     }


    public BudgetDetailsService(BudgetDetailsRepository repository, JournalAuditService journalAuditService,CompteResultatCalculService compteResultatCalculService) {
        this.repository = repository;
        this.journalAuditService = journalAuditService;
        this.compteResultatCalculService = compteResultatCalculService;
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

    public List<Map<String, Object>> getAmortissements(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat =
                repository.getAmortissements(exerciceId);

        enregistrerConsultation(
                auteurId, "AMORTISSEMENTS", exerciceId
        );

        return resultat;
    }


    public List<Map<String, Object>> getAmortissementsTotaux(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat =
                repository.getAmortissementsTotaux(exerciceId);

        enregistrerConsultation(
                auteurId, "AMORTISSEMENTS_TOTAUX", exerciceId
        );

        return resultat;
    }

    public List<Map<String, Object>> getAmortissementsAnnuel(
            Integer exerciceId,
            Integer auteurId
    ) {
        List<Map<String, Object>> resultat =
                repository.getAmortissementsAnnuel(exerciceId);

        enregistrerConsultation(
                auteurId, "AMORTISSEMENTS_ANNUEL", exerciceId
        );

        return resultat;
    }




        private BigDecimal[] convertirMontantsMensuels(
                List<Map<String, Object>> lignes,
                String colonneMois,
                String colonneMontant
        ) {
        BigDecimal[] resultat = new BigDecimal[12];

        Arrays.fill(resultat, BigDecimal.ZERO);

        for (Map<String, Object> ligne : lignes) {

                Object moisObject = ligne.get(colonneMois);

                if (!(moisObject instanceof Number)) {
                throw new IllegalStateException(
                        "Numéro de mois invalide : " + moisObject
                );
                }

                int mois = ((Number) moisObject).intValue();

                if (mois < 1 || mois > 12) {
                throw new IllegalStateException(
                        "Mois hors limites : " + mois
                );
                }

                Object montantObject = ligne.get(colonneMontant);

                if (montantObject == null) {
                continue;
                }

                BigDecimal montant = new BigDecimal(
                        montantObject.toString()
                );

                resultat[mois - 1] = resultat[mois - 1].add(montant);
        }

        return resultat;
        }

        

private Map<String, BigDecimal[]> construireDonneesCR(
        Integer exerciceId
) {
    Map<String, BigDecimal[]> donnees =
            new LinkedHashMap<>();

    List<Map<String, Object>> budgetMensuel =
            repository.getBudgetMensuelPourCR(exerciceId);

    donnees.put(
            "CA",
            convertirMontantsMensuels(
                    budgetMensuel,
                    "mois_id",
                    "ca_export"
            )
    );

    donnees.put(
            "PERSONNEL",
            convertirMontantsMensuels(
                    budgetMensuel,
                    "mois_id",
                    "masse_salariale"
            )
    );

    donnees.put(
            "AMORTISSEMENTS",
            convertirMontantsMensuels(
                    repository.getAmortissementsPourCR(exerciceId),
                    "mois",
                    "montant"
            )
    );

    return donnees;
}


        public List<Map<String, Object>> getCompteResultat(
                Integer exerciceId,
                Integer auteurId
        ) {
        Map<String, BigDecimal[]> donnees =
                construireDonneesCR(exerciceId);

        List<Map<String, Object>> resultat =
                compteResultatCalculService.calculerCompteResultat(donnees);

        enregistrerConsultation(
                auteurId,
                "COMPTE_RESULTAT",
                exerciceId
        );

        return resultat;
        }


        

    
}
