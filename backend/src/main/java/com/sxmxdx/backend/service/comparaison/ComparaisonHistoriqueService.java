package com.sxmxdx.backend.service.comparaison;

import com.sxmxdx.backend.dto.comparaison.*;
import com.sxmxdx.backend.entity.comparaison.*;
import com.sxmxdx.backend.repository.comparaison.*;
import com.sxmxdx.backend.service.JournalAuditService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.*;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ComparaisonHistoriqueService {

    private final BudgetComparaisonRepository budgets;
    private final ExerciceComparaisonRepository exercices;
    private final JournalAuditService journalAuditService;

    public ComparaisonHistoriqueService(
            BudgetComparaisonRepository budgets,
            ExerciceComparaisonRepository exercices,
            JournalAuditService journalAuditService
    ) {
        this.budgets = budgets;
        this.exercices = exercices;
        this.journalAuditService = journalAuditService;
    }

    public List<Integer> anneesDisponibles() {
        return exercices.anneesAvecBudget();
    }

    private BudgetComparaison budgetPour(Integer annee) {
        ExerciceComparaison exercice = exercices.findByAnnee(annee)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Exercice absent : " + annee
            ));

        List<BudgetComparaison> candidats =
            budgets.findByExerciceId(exercice.getId());

        if (candidats.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Aucun budget pour " + annee
            );
        }

        if (candidats.size() > 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Plusieurs budgets pour " + annee
                    + " : sélection du budget de référence nécessaire"
            );
        }

        return candidats.get(0);
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private IndicateurComparaisonDTO indicateur(
            String code,
            String libelle,
            String unite,
            BigDecimal x,
            BigDecimal y
    ) {
        BigDecimal a = nz(x);
        BigDecimal b = nz(y);
        BigDecimal ecart = b.subtract(a);
        BigDecimal evolution = null;

        if ("POINT".equals(unite)) {
            evolution = ecart.multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
        } else if (a.signum() != 0) {
            evolution = ecart.multiply(BigDecimal.valueOf(100))
                .divide(a.abs(), 2, RoundingMode.HALF_UP);
        }

        String tendance = ecart.signum() > 0
            ? "AUGMENTATION"
            : ecart.signum() < 0
                ? "DIMINUTION"
                : "STABLE";

        return new IndicateurComparaisonDTO(
            code, libelle, unite,
            a, b, ecart, evolution, tendance
        );
    }

    private void enregistrerAudit(
            Integer auteurId,
            String action,
            String description,
            String entiteId,
            String statut
    ) {
        try {
            journalAuditService.enregistrer(
                auteurId,
                action,
                "COMPARAISON",
                description,
                "COMPARAISON_HISTORIQUE",
                entiteId,
                statut
            );
        } catch (Exception e) {
            System.err.println("[AUDIT] " + e.getMessage());
        }
    }

    public ComparaisonHistoriqueDTO comparer(
            Integer annee1,
            Integer annee2,
            Integer auteurId
    ) {
        try {
            if (annee1 == null || annee2 == null
                    || annee1.equals(annee2)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Choisir deux années différentes"
                );
            }

            BudgetComparaison a = budgetPour(annee1);
            BudgetComparaison b = budgetPour(annee2);

            List<IndicateurComparaisonDTO> lignes = List.of(
                indicateur(
                    "CA_EXPORT", "Chiffre d'affaires export",
                    "MGA", a.getCaExport(), b.getCaExport()
                ),
                indicateur(
                    "CHARGES", "Charges d'exploitation",
                    "MGA", a.getChargesExploitation(),
                    b.getChargesExploitation()
                ),
                indicateur(
                    "FRAIS_EXPORT", "Frais d'exportation",
                    "MGA", a.getFraisExport(), b.getFraisExport()
                ),
                indicateur(
                    "MASSE_SALARIALE", "Masse salariale",
                    "MGA", a.getMasseSalariale(),
                    b.getMasseSalariale()
                ),
                indicateur(
                    "RESULTAT", "Résultat opérationnel",
                    "MGA", a.getResultatOperationnel(),
                    b.getResultatOperationnel()
                ),
                indicateur(
                    "MARGE", "Marge opérationnelle",
                    "POINT", a.getMargeOperationnelle(),
                    b.getMargeOperationnelle()
                )
            );

            List<String> commentaires = new ArrayList<>();

            for (IndicateurComparaisonDTO i : lignes) {
                if (i.evolutionPourcentage() == null) {
                    commentaires.add(
                        i.libelle()
                        + " : variation relative non calculable "
                        + "(référence nulle)."
                    );
                    continue;
                }

                String mouvement =
                    i.tendance().equals("AUGMENTATION")
                        ? "augmente"
                        : i.tendance().equals("DIMINUTION")
                            ? "diminue"
                            : "reste stable";

                commentaires.add(
                    i.libelle() + " " + mouvement + " de "
                    + i.evolutionPourcentage().abs().toPlainString()
                    + (i.unite().equals("POINT") ? " point(s)" : " %")
                    + " entre " + annee1 + " et " + annee2 + "."
                );
            }

            ComparaisonHistoriqueDTO resultat =
                new ComparaisonHistoriqueDTO(
                    annee1,
                    annee2,
                    a.getId(),
                    b.getId(),
                    lignes,
                    commentaires
                );

            enregistrerAudit(
                auteurId,
                "COMPARAISON_HISTORIQUE",
                "Comparaison historique réussie entre "
                    + annee1 + " et " + annee2
                    + " (budgets " + a.getId()
                    + " et " + b.getId() + ")",
                a.getId() + "-" + b.getId(),
                "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {

            enregistrerAudit(
                auteurId,
                "ECHEC_COMPARAISON_HISTORIQUE",
                "Échec de comparaison entre "
                    + annee1 + " et " + annee2
                    + " : " + e.getMessage(),
                null,
                "ECHEC"
            );

            throw e;
        }
    }
}

