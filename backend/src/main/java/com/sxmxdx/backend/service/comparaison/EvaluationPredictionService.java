
// package com.sxmxdx.backend.service.comparaison;

// import com.sxmxdx.backend.dto.comparaison.*;
// import com.sxmxdx.backend.entity.comparaison.*;
// import com.sxmxdx.backend.repository.comparaison.*;

// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.server.ResponseStatusException;

// import java.math.BigDecimal;
// import java.math.RoundingMode;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Locale;

// @Service
// @Transactional(readOnly = true)
// public class EvaluationPredictionService {

//     private final EvaluationPredictionRepository budgets;
//     private final ExerciceComparaisonRepository exercices;

//     public EvaluationPredictionService(
//             EvaluationPredictionRepository budgets,
//             ExerciceComparaisonRepository exercices
//     ) {
//         this.budgets = budgets;
//         this.exercices = exercices;
//     }

//     public List<Integer> exercicesDisponibles() {
//         return budgets.findAnneesEvaluables();
//     }

//     private BudgetComparaison unique(
//             Integer exerciceId,
//             String type
//     ) {
//         List<BudgetComparaison> candidats =
//                 budgets.findByExerciceAndType(exerciceId, type);

//         if (candidats.isEmpty()) {
//             throw new ResponseStatusException(
//                     HttpStatus.CONFLICT,
//                     "Évaluation indisponible : budget "
//                             + type
//                             + " absent pour cet exercice"
//             );
//         }

//         if (candidats.size() > 1) {
//             throw new ResponseStatusException(
//                     HttpStatus.CONFLICT,
//                     "Plusieurs budgets "
//                             + type
//                             + " existent : choisir une version "
//                             + "de référence avant l'évaluation"
//             );
//         }

//         return candidats.get(0);
//     }

//     private IndicateurEvaluationDTO ligne(
//             String code,
//             String libelle,
//             String unite,
//             BigDecimal reel,
//             BigDecimal prevu
//     ) {
//         if (reel == null || prevu == null) {
//             throw new ResponseStatusException(
//                     HttpStatus.UNPROCESSABLE_ENTITY,
//                     "Valeur absente pour l'indicateur " + code
//             );
//         }

//         // Écart signé : prévision - constaté
//         BigDecimal ecart = prevu.subtract(reel);

//         // Erreur absolue
//         BigDecimal erreur = ecart.abs();

//         // Erreur relative absolue en pourcentage
//         BigDecimal pourcentage = null;

//         if (reel.signum() != 0) {
//             pourcentage = erreur
//                     .multiply(BigDecimal.valueOf(100))
//                     .divide(
//                             reel.abs(),
//                             2,
//                             RoundingMode.HALF_UP
//                     );
//         }

//         String diagnostic;

//         if (ecart.signum() > 0) {
//             diagnostic = "SURESTIMATION";
//         } else if (ecart.signum() < 0) {
//             diagnostic = "SOUS_ESTIMATION";
//         } else {
//             diagnostic = "CONFORME";
//         }

//         return new IndicateurEvaluationDTO(
//                 code,
//                 libelle,
//                 unite,
//                 reel,
//                 prevu,
//                 ecart,
//                 erreur,
//                 pourcentage,
//                 diagnostic
//         );
//     }

//     public EvaluationPredictionDTO evaluer(Integer annee) {

//         if (annee == null) {
//             throw new ResponseStatusException(
//                     HttpStatus.BAD_REQUEST,
//                     "Année obligatoire"
//             );
//         }

//         ExerciceComparaison exercice = exercices
//                 .findByAnnee(annee)
//                 .orElseThrow(() ->
//                         new ResponseStatusException(
//                                 HttpStatus.NOT_FOUND,
//                                 "Exercice introuvable"
//                         )
//                 );

//         BudgetComparaison genere = unique(
//                 exercice.getId(),
//                 "GENERE"
//         );

//         BudgetComparaison previsionnel = unique(
//                 exercice.getId(),
//                 "PREVISIONNEL"
//         );

//         List<IndicateurEvaluationDTO> indicateurs = List.of(

//                 ligne(
//                         "CA_EXPORT",
//                         "Chiffre d'affaires export",
//                         "MGA",
//                         genere.getCaExport(),
//                         previsionnel.getCaExport()
//                 ),

//                 ligne(
//                         "CHARGES",
//                         "Charges d'exploitation",
//                         "MGA",
//                         genere.getChargesExploitation(),
//                         previsionnel.getChargesExploitation()
//                 ),

//                 ligne(
//                         "FRAIS_EXPORT",
//                         "Frais d'exportation",
//                         "MGA",
//                         genere.getFraisExport(),
//                         previsionnel.getFraisExport()
//                 ),

//                 ligne(
//                         "MASSE_SALARIALE",
//                         "Masse salariale",
//                         "MGA",
//                         genere.getMasseSalariale(),
//                         previsionnel.getMasseSalariale()
//                 ),

//                 ligne(
//                         "RESULTAT",
//                         "Résultat opérationnel",
//                         "MGA",
//                         genere.getResultatOperationnel(),
//                         previsionnel.getResultatOperationnel()
//                 ),

//                 ligne(
//                         "MARGE",
//                         "Marge opérationnelle",
//                         "POINT",
//                         genere.getMargeOperationnelle(),
//                         previsionnel.getMargeOperationnelle()
//                 )
//         );

//         List<String> interpretations = new ArrayList<>();

//         for (IndicateurEvaluationDTO indicateur : indicateurs) {

//             String erreurRelative;

//             if (indicateur.getErreurPourcentage() == null) {
//                 erreurRelative =
//                         "erreur relative non calculable "
//                         + "(valeur constatée nulle)";
//             } else {
//                 erreurRelative =
//                         "erreur relative absolue de "
//                         + indicateur
//                                 .getErreurPourcentage()
//                                 .toPlainString()
//                         + " %";
//             }

//             if ("POINT".equals(indicateur.getUnite())) {

//                 BigDecimal points = indicateur
//                         .getEcart()
//                         .multiply(BigDecimal.valueOf(100))
//                         .setScale(2, RoundingMode.HALF_UP);

//                 interpretations.add(
//                         indicateur.getLibelle()
//                                 + " : écart signé de "
//                                 + points.toPlainString()
//                                 + " point(s) ; "
//                                 + erreurRelative
//                                 + "."
//                 );

//             } else {

//                 String diagnostic = indicateur
//                         .getDiagnostic()
//                         .toLowerCase(Locale.ROOT)
//                         .replace('_', ' ');

//                 interpretations.add(
//                         indicateur.getLibelle()
//                                 + " : "
//                                 + diagnostic
//                                 + " ; "
//                                 + erreurRelative
//                                 + "."
//                 );
//             }
//         }

//         return new EvaluationPredictionDTO(
//                 annee,
//                 genere.getId(),
//                 previsionnel.getId(),
//                 indicateurs,
//                 interpretations
//         );
//     }
// }






package com.sxmxdx.backend.service.comparaison;

import com.sxmxdx.backend.dto.comparaison.*;
import com.sxmxdx.backend.entity.comparaison.*;
import com.sxmxdx.backend.repository.comparaison.*;
import com.sxmxdx.backend.service.JournalAuditService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class EvaluationPredictionService {

    private final EvaluationPredictionRepository budgets;
    private final ExerciceComparaisonRepository exercices;
    private final JournalAuditService journalAuditService;

    public EvaluationPredictionService(
            EvaluationPredictionRepository budgets,
            ExerciceComparaisonRepository exercices,
            JournalAuditService journalAuditService
    ) {
        this.budgets = budgets;
        this.exercices = exercices;
        this.journalAuditService = journalAuditService;
    }

    // Exercices disponibles
    public List<Integer> exercicesDisponibles() {
        return budgets.findAnneesEvaluables();
    }

    // Recherche d'un budget unique
    private BudgetComparaison unique(
            Integer exerciceId,
            String type
    ) {
        List<BudgetComparaison> candidats =
                budgets.findByExerciceAndType(exerciceId, type);

        if (candidats.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Évaluation indisponible : budget "
                            + type
                            + " absent pour cet exercice"
            );
        }

        if (candidats.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Plusieurs budgets "
                            + type
                            + " existent : choisir une version "
                            + "de référence avant l'évaluation"
            );
        }

        return candidats.get(0);
    }

    // Calcul d'un indicateur
    private IndicateurEvaluationDTO ligne(
            String code,
            String libelle,
            String unite,
            BigDecimal reel,
            BigDecimal prevu
    ) {
        if (reel == null || prevu == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Valeur absente pour l'indicateur " + code
            );
        }

        // Écart signé : prévision - constaté
        BigDecimal ecart = prevu.subtract(reel);

        // Erreur absolue
        BigDecimal erreur = ecart.abs();

        // Erreur relative absolue en pourcentage
        BigDecimal pourcentage = null;

        if (reel.signum() != 0) {
            pourcentage = erreur
                    .multiply(BigDecimal.valueOf(100))
                    .divide(
                            reel.abs(),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        String diagnostic;

        if (ecart.signum() > 0) {
            diagnostic = "SURESTIMATION";
        } else if (ecart.signum() < 0) {
            diagnostic = "SOUS_ESTIMATION";
        } else {
            diagnostic = "CONFORME";
        }

        return new IndicateurEvaluationDTO(
                code,
                libelle,
                unite,
                reel,
                prevu,
                ecart,
                erreur,
                pourcentage,
                diagnostic
        );
    }

    // Enregistrement dans le journal d'audit
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
                    "EVALUATION_PREDICTION",
                    entiteId,
                    statut
            );
        } catch (Exception e) {
            System.err.println(
                    "[AUDIT EVALUATION] " + e.getMessage()
            );
        }
    }

    // Évaluation avec traçabilité
    public EvaluationPredictionDTO evaluer(
            Integer annee,
            Integer auteurId
    ) {
        try {

            if (annee == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Année obligatoire"
                );
            }

            ExerciceComparaison exercice = exercices
                    .findByAnnee(annee)
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Exercice introuvable"
                            )
                    );

            BudgetComparaison genere = unique(
                    exercice.getId(),
                    "GENERE"
            );

            BudgetComparaison previsionnel = unique(
                    exercice.getId(),
                    "PREVISIONNEL"
            );

            List<IndicateurEvaluationDTO> indicateurs = List.of(

                    ligne(
                            "CA_EXPORT",
                            "Chiffre d'affaires export",
                            "MGA",
                            genere.getCaExport(),
                            previsionnel.getCaExport()
                    ),

                    ligne(
                            "CHARGES",
                            "Charges d'exploitation",
                            "MGA",
                            genere.getChargesExploitation(),
                            previsionnel.getChargesExploitation()
                    ),

                    ligne(
                            "FRAIS_EXPORT",
                            "Frais d'exportation",
                            "MGA",
                            genere.getFraisExport(),
                            previsionnel.getFraisExport()
                    ),

                    ligne(
                            "MASSE_SALARIALE",
                            "Masse salariale",
                            "MGA",
                            genere.getMasseSalariale(),
                            previsionnel.getMasseSalariale()
                    ),

                    ligne(
                            "RESULTAT",
                            "Résultat opérationnel",
                            "MGA",
                            genere.getResultatOperationnel(),
                            previsionnel.getResultatOperationnel()
                    ),

                    ligne(
                            "MARGE",
                            "Marge opérationnelle",
                            "POINT",
                            genere.getMargeOperationnelle(),
                            previsionnel.getMargeOperationnelle()
                    )
            );

            List<String> interpretations = new ArrayList<>();

            for (IndicateurEvaluationDTO indicateur : indicateurs) {

                String erreurRelative;

                if (indicateur.getErreurPourcentage() == null) {
                    erreurRelative =
                            "erreur relative non calculable "
                            + "(valeur constatée nulle)";
                } else {
                    erreurRelative =
                            "erreur relative absolue de "
                            + indicateur
                                    .getErreurPourcentage()
                                    .toPlainString()
                            + " %";
                }

                if ("POINT".equals(indicateur.getUnite())) {

                    BigDecimal points = indicateur
                            .getEcart()
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP);

                    interpretations.add(
                            indicateur.getLibelle()
                                    + " : écart signé de "
                                    + points.toPlainString()
                                    + " point(s) ; "
                                    + erreurRelative
                                    + "."
                    );

                } else {

                    String diagnostic = indicateur
                            .getDiagnostic()
                            .toLowerCase(Locale.ROOT)
                            .replace('_', ' ');

                    interpretations.add(
                            indicateur.getLibelle()
                                    + " : "
                                    + diagnostic
                                    + " ; "
                                    + erreurRelative
                                    + "."
                    );
                }
            }

            EvaluationPredictionDTO resultat =
                    new EvaluationPredictionDTO(
                            annee,
                            genere.getId(),
                            previsionnel.getId(),
                            indicateurs,
                            interpretations
                    );

            // Audit : évaluation réussie
            enregistrerAudit(
                    auteurId,
                    "EVALUATION_PREDICTION",
                    "Évaluation de la prévision pour l'exercice "
                            + annee
                            + genere.getId()
                            + previsionnel.getId(),
                    String.valueOf(exercice.getId()),
                    "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {

            // Audit : évaluation échouée
            enregistrerAudit(
                    auteurId,
                    "ECHEC_EVALUATION_PREDICTION",
                    "Échec de l'évaluation pour l'exercice "
                            + annee
                            + " : " + e.getMessage(),
                    annee == null ? null : String.valueOf(annee),
                    "ECHEC"
            );

            throw e;
        }
    }
}
