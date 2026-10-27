package com.sxmxdx.backend.service.prediction;

import com.sxmxdx.backend.entity.prediction.*;
import com.sxmxdx.backend.repository.prediction.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class PredictionDetailsService {

    private final BudgetPrevisionDetailRepository budgetRepository;
    private final BudgetMensuelPrevisionDetailRepository mensuelRepository;
    private final PredictionChargeCategorieRepository categorieRepository;

    public PredictionDetailsService(
        BudgetPrevisionDetailRepository budgetRepository,
        BudgetMensuelPrevisionDetailRepository mensuelRepository,
        PredictionChargeCategorieRepository categorieRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.mensuelRepository = mensuelRepository;
        this.categorieRepository = categorieRepository;
    }

    private BudgetPrevisionDetail trouverBudget(Integer annee) {
        return budgetRepository.dernierBudget(annee)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Aucun budget prévisionnel pour " + annee
            ));
    }

    private BigDecimal montant(BigDecimal valeur) {
        return valeur == null ? BigDecimal.ZERO : valeur;
    }

    private static final String[] MOIS = {
        "Janvier", "Février", "Mars", "Avril",
        "Mai", "Juin", "Juillet", "Août",
        "Septembre", "Octobre", "Novembre", "Décembre"
    };

    public Map<String, Object> getAmortissements(Integer annee) {

        BudgetPrevisionDetail budget = trouverBudget(annee);

        List<BudgetMensuelPrevisionDetail> lignes =
            mensuelRepository.findByBudgetIdOrderByMoisIdAsc(
                budget.getId()
            );

        Map<Integer, BigDecimal> parMois = new HashMap<>();

        for (BudgetMensuelPrevisionDetail ligne : lignes) {
            parMois.merge(
                ligne.getMoisId(),
                montant(ligne.getAmortissements()),
                BigDecimal::add
            );
        }

        List<Map<String, Object>> mensuel = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (int mois = 1; mois <= 12; mois++) {
            BigDecimal valeur = parMois.getOrDefault(
                mois, BigDecimal.ZERO
            );

            total = total.add(valeur);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mois_id", mois);
            item.put("mois", MOIS[mois - 1]);
            item.put("montant", valeur);
            mensuel.add(item);
        }

        Map<String, Object> reponse = new LinkedHashMap<>();
        reponse.put("annee", annee);
        reponse.put("budget_id", budget.getId());
        reponse.put("type_budget", "PREVISIONNEL");
        reponse.put("total_annuel", total);
        reponse.put("mensuel", mensuel);

        return reponse;
    }

    public Map<String, Object> getChargesCategories(Integer annee) {

        BudgetPrevisionDetail budget = trouverBudget(annee);

        List<PredictionChargeCategorie> lignes =
            categorieRepository
                .findByBudgetIdOrderByMoisIdAscCategorieAsc(
                    budget.getId()
                );

        Map<String, BigDecimal> totauxCategories =
            new TreeMap<>();

        Map<Integer, BigDecimal> totauxMois =
            new TreeMap<>();

        List<Map<String, Object>> details =
            new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        for (PredictionChargeCategorie ligne : lignes) {

            BigDecimal valeur = montant(
                ligne.getMontantPrevu()
            );

            totauxCategories.merge(
                ligne.getCategorie(),
                valeur,
                BigDecimal::add
            );

            totauxMois.merge(
                ligne.getMoisId(),
                valeur,
                BigDecimal::add
            );

            total = total.add(valeur);

            Map<String, Object> detail =
                new LinkedHashMap<>();

            detail.put("mois_id", ligne.getMoisId());
            detail.put("categorie", ligne.getCategorie());
            detail.put("montant_prevu", valeur);

            details.add(detail);
        }

        List<Map<String, Object>> categories =
            new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry :
                totauxCategories.entrySet()) {

            Map<String, Object> item =
                new LinkedHashMap<>();

            item.put("categorie", entry.getKey());
            item.put("total_annuel", entry.getValue());

            categories.add(item);
        }

        List<Map<String, Object>> mensuel =
            new ArrayList<>();

        for (int mois = 1; mois <= 12; mois++) {

            Map<String, Object> item =
                new LinkedHashMap<>();

            item.put("mois_id", mois);
            item.put("mois", MOIS[mois - 1]);
            item.put(
                "total",
                totauxMois.getOrDefault(
                    mois, BigDecimal.ZERO
                )
            );

            mensuel.add(item);
        }

        Map<String, Object> reponse =
            new LinkedHashMap<>();

        reponse.put("annee", annee);
        reponse.put("budget_id", budget.getId());
        reponse.put("type_budget", "PREVISIONNEL");
        reponse.put("total_annuel", total);
        reponse.put("categories", categories);
        reponse.put("mensuel", mensuel);
        reponse.put("details", details);

        return reponse;
    }
}
