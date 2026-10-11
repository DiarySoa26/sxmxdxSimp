package com.sxmxdx.backend.service.campagne;

import com.sxmxdx.backend.entity.campagne.*;
import com.sxmxdx.backend.repository.campagne.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Service
public class CampagneSuiviService {

    private final CampagneBudgetaireRepository campagnes;
    private final JalonBudgetaireRepository jalons;

    public CampagneSuiviService(
        CampagneBudgetaireRepository campagnes,
        JalonBudgetaireRepository jalons
    ) {
        this.campagnes = campagnes;
        this.jalons = jalons;
    }

    @Transactional
    public void terminerEtape(Long campagneId, String code) {
        if (campagneId == null) return;

        if (!Set.of("IMPORTATION", "GENERATION").contains(code))
            throw new IllegalArgumentException("Jalon automatique invalide");

        CampagneBudgetaire c = campagnes.findById(campagneId)
            .orElseThrow(() -> new IllegalArgumentException("Campagne introuvable"));

        if ("TERMINEE".equals(c.getStatut()) || "ANNULEE".equals(c.getStatut()))
            return;

        JalonBudgetaire j = jalons.findByCampagneIdAndCode(campagneId, code)
            .orElseThrow(() -> new IllegalArgumentException("Jalon introuvable"));

        if (!"TERMINE".equals(j.getStatut())) {
            j.setStatut("TERMINE");
            j.setDateRealisation(LocalDateTime.now());
            jalons.save(j);
        }

        if ("PLANIFIEE".equals(c.getStatut())) {
            c.setStatut("EN_COURS");
            campagnes.save(c);
        }
    }

    public void importationTerminee(Long campagneId) {
        terminerEtape(campagneId, "IMPORTATION");
    }

    public void generationTerminee(Long campagneId) {
        terminerEtape(campagneId, "GENERATION");
    }
}