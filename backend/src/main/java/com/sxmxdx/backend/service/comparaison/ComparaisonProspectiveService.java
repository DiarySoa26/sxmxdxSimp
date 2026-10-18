package com.sxmxdx.backend.service.comparaison;

import com.sxmxdx.backend.dto.comparaison.*;
import com.sxmxdx.backend.entity.comparaison.BudgetComparaison;
import com.sxmxdx.backend.repository.comparaison.ProspectiveRepository;
import com.sxmxdx.backend.service.JournalAuditService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ComparaisonProspectiveService {

    private final ProspectiveRepository repository;
    private final JournalAuditService journalAuditService;

    public ComparaisonProspectiveService(
        ProspectiveRepository repository,
        JournalAuditService journalAuditService
    ) {
        this.repository = repository;
        this.journalAuditService = journalAuditService;
    }

    // Années disponibles
    public List<Integer> getBudgetsDisponibles() {
        return repository.anneesByType("GENERE");
    }

    public List<Integer> getPrevisionsDisponibles() {
        return repository.anneesByType("PREVISIONNEL");
    }

    // Recherche du budget
    private BudgetComparaison trouverBudget(int annee, String type) {

        var budgets = repository.byAnneeAndType(annee, type);

        if (budgets.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Aucun budget " + type + " pour " + annee
            );
        }

        if (budgets.size() > 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Plusieurs budgets " + type + " pour " + annee
            );
        }

        return budgets.get(0);
    }

    // Calcul des indicateurs
    private IndicateurComparaisonDTO calculer(
        String code,
        String libelle,
        String unite,
        BigDecimal reference,
        BigDecimal prevision
    ) {
        BigDecimal v1 = reference == null
            ? BigDecimal.ZERO : reference;

        BigDecimal v2 = prevision == null
            ? BigDecimal.ZERO : prevision;

        BigDecimal ecart = v2.subtract(v1);

        BigDecimal evolution = "POINT".equals(unite)
            ? ecart.multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP)
            : v1.signum() == 0
                ? null
                : ecart.multiply(BigDecimal.valueOf(100))
                    .divide(v1.abs(), 2, RoundingMode.HALF_UP);

        String tendance = ecart.signum() > 0
            ? "AUGMENTATION"
            : ecart.signum() < 0
                ? "DIMINUTION"
                : "STABLE";

        return new IndicateurComparaisonDTO(
            code,
            libelle,
            unite,
            v1,
            v2,
            ecart,
            evolution,
            tendance
        );
    }

    // Journalisation des actions
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
                "COMPARAISON_PROSPECTIVE",
                entiteId,
                statut
            );
        } catch (Exception e) {
            System.err.println(
                "[AUDIT PROSPECTIVE] " + e.getMessage()
            );
        }
    }

    // Comparaison prospective avec traçabilité
    public ComparaisonProspectiveDTO comparer(
        Integer anneeBudget,
        Integer anneePrevision,
        Integer auteurId
    ) {
        try {

            if (anneeBudget == null
                    || anneePrevision == null
                    || anneePrevision <= anneeBudget) {

                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les années de comparaison sont invalides"
                );
            }

            var budget = trouverBudget(
                anneeBudget,
                "GENERE"
            );

            var prevision = trouverBudget(
                anneePrevision,
                "PREVISIONNEL"
            );

            var indicateurs = List.of(
                calculer(
                    "CA_EXPORT",
                    "Chiffre d'affaires export",
                    "MGA",
                    budget.getCaExport(),
                    prevision.getCaExport()
                ),
                calculer(
                    "CHARGES",
                    "Charges d'exploitation",
                    "MGA",
                    budget.getChargesExploitation(),
                    prevision.getChargesExploitation()
                ),
                calculer(
                    "FRAIS_EXPORT",
                    "Frais d'exportation",
                    "MGA",
                    budget.getFraisExport(),
                    prevision.getFraisExport()
                ),
                calculer(
                    "MASSE_SALARIALE",
                    "Masse salariale",
                    "MGA",
                    budget.getMasseSalariale(),
                    prevision.getMasseSalariale()
                ),
                calculer(
                    "RESULTAT",
                    "Résultat opérationnel",
                    "MGA",
                    budget.getResultatOperationnel(),
                    prevision.getResultatOperationnel()
                ),
                calculer(
                    "MARGE",
                    "Marge opérationnelle",
                    "POINT",
                    budget.getMargeOperationnelle(),
                    prevision.getMargeOperationnelle()
                )
            );

            // Interprétations automatiques
            var interpretations = indicateurs.stream().map(i -> {

                if (i.evolutionPourcentage() == null) {
                    return i.libelle()
                        + " : évolution non calculable.";
                }

                String mouvement = switch (i.tendance()) {
                    case "AUGMENTATION" -> "augmente";
                    case "DIMINUTION" -> "diminue";
                    default -> "reste stable";
                };

                String unite = "POINT".equals(i.unite())
                    ? " point(s)"
                    : " %";

                return i.libelle() + " " + mouvement
                    + " de "
                    + i.evolutionPourcentage().abs().toPlainString()
                    + unite
                    + " entre " + anneeBudget
                    + " et " + anneePrevision + ".";
            }).toList();

            ComparaisonProspectiveDTO resultat =
                new ComparaisonProspectiveDTO(
                    anneeBudget,
                    anneePrevision,
                    budget.getId(),
                    prevision.getId(),
                    indicateurs,
                    interpretations
                );

            // Enregistrer le succès
            enregistrerAudit(
                auteurId,
                "COMPARAISON_PROSPECTIVE",
                "Comparaison prospective entre le budget généré "
                    + anneeBudget
                    + " (ID " + budget.getId() + ")"
                    + " et la prévision " + anneePrevision
                    + " (ID " + prevision.getId() + ")",
                budget.getId() + "-" + prevision.getId(),
                "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {

            // Enregistrer l'échec
            enregistrerAudit(
                auteurId,
                "ECHEC_COMPARAISON_PROSPECTIVE",
                "Échec de comparaison entre "
                    + anneeBudget
                    + " et " + anneePrevision
                    + " : " + e.getMessage(),
                null,
                "ECHEC"
            );

            throw e;
        }
    }
}


