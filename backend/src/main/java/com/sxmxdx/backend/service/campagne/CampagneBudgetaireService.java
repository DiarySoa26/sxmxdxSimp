package com.sxmxdx.backend.service.campagne;

import com.sxmxdx.backend.dto.campagne.*;
import com.sxmxdx.backend.entity.campagne.*;
import com.sxmxdx.backend.repository.campagne.*;
import com.sxmxdx.backend.service.JournalAuditService;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CampagneBudgetaireService {

    private final CampagneBudgetaireRepository campagnes;
    private final JalonBudgetaireRepository jalons;
    private final JdbcTemplate jdbc;
    private final JournalAuditService journalAuditService;

    public CampagneBudgetaireService(
            CampagneBudgetaireRepository campagnes,
            JalonBudgetaireRepository jalons,
            JdbcTemplate jdbc,
            JournalAuditService journalAuditService
    ) {
        this.campagnes = campagnes;
        this.jalons = jalons;
        this.jdbc = jdbc;
        this.journalAuditService = journalAuditService;
    }

    private void audit(
            Integer auteurId,
            String action,
            String description,
            String entiteType,
            String entiteId,
            String statut
    ) {
        if (auteurId == null) {
            System.err.println(
                "[AUDIT CAMPAGNE] auteurId absent : " + action
            );
            return;
        }

        Runnable enregistrer = () -> {
            try {
                journalAuditService.enregistrer(
                    auteurId, action, "CAMPAGNE",
                    description, entiteType, entiteId, statut
                );
            } catch (Exception e) {
                System.err.println(
                    "[AUDIT CAMPAGNE] " + e.getMessage()
                );
            }
        };

        if ("SUCCES".equals(statut)
                && TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        enregistrer.run();
                    }
                }
            );
        } else {
            enregistrer.run();
        }
    }

    private ResponseStatusException erreur(
            HttpStatus status, String message
    ) {
        return new ResponseStatusException(status, message);
    }

    private CampagneBudgetaire trouver(Long id) {
        return campagnes.findById(id).orElseThrow(
            () -> erreur(HttpStatus.NOT_FOUND, "Campagne introuvable")
        );
    }

    private void modifiable(CampagneBudgetaire campagne) {
        if (Set.of("TERMINEE", "ANNULEE").contains(campagne.getStatut())) {
            throw erreur(HttpStatus.CONFLICT, "Campagne fermée");
        }
    }

    private void verifier(CampagneRequest r) {
        if (r == null || r.getNom() == null || r.getNom().isBlank()
                || r.getExerciceId() == null
                || r.getDateDebut() == null
                || r.getDateFin() == null
                || r.getDateImportation() == null
                || r.getDateGeneration() == null
                || r.getDateVerification() == null
                || r.getDateValidation() == null) {
            throw erreur(
                HttpStatus.BAD_REQUEST,
                "Champs obligatoires manquants"
            );
        }

        LocalDate precedente = r.getDateDebut();

        for (LocalDate date : List.of(
                r.getDateImportation(),
                r.getDateGeneration(),
                r.getDateVerification(),
                r.getDateValidation(),
                r.getDateFin()
        )) {
            if (date.isBefore(precedente)) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Ordre chronologique des échéances invalide"
                );
            }
            precedente = date;
        }
    }


    private void ajouter(
            Long campagneId,
            String nom,
            String code,
            int ordre,
            LocalDate dateLimite
    ) {
        JalonBudgetaire jalon = new JalonBudgetaire();
        jalon.setCampagneId(campagneId);
        jalon.setNom(nom);
        jalon.setCode(code);
        jalon.setOrdre(ordre);
        jalon.setDateLimite(dateLimite);
        jalon.setStatut("EN_ATTENTE");
        jalons.save(jalon);
    }

    private void ajouterTermine(
            Long campagneId,
            String nom,
            String code,
            int ordre,
            LocalDateTime dateRealisation
    ) {
        JalonBudgetaire jalon = new JalonBudgetaire();
        jalon.setCampagneId(campagneId);
        jalon.setNom(nom);
        jalon.setCode(code);
        jalon.setOrdre(ordre);
        jalon.setDateLimite(dateRealisation.toLocalDate());
        jalon.setDateRealisation(dateRealisation);
        jalon.setStatut("TERMINE");
        jalons.save(jalon);
    }

    @Transactional
    public CampagneBudgetaire creer(
            CampagneRequest r, Integer auteurId
    ) {
        try {
            verifier(r);

            CampagneBudgetaire campagne = new CampagneBudgetaire();
            campagne.setNom(r.getNom().trim());
            campagne.setExerciceId(r.getExerciceId());
            campagne.setDateDebut(r.getDateDebut());
            campagne.setDateFin(r.getDateFin());
            campagne.setStatut("PLANIFIEE");

            campagne = campagnes.save(campagne);

            ajouter(campagne.getId(), "Importation",
                    "IMPORTATION", 1, r.getDateImportation());
            ajouter(campagne.getId(), "Génération du budget",
                    "GENERATION", 2, r.getDateGeneration());
            ajouter(campagne.getId(), "Vérification",
                    "VERIFICATION", 3, r.getDateVerification());
            ajouter(campagne.getId(), "Validation",
                    "VALIDATION", 4, r.getDateValidation());

            audit(
                auteurId, "CREATION_CAMPAGNE",
                "Création de la campagne " + campagne.getNom(),
                "CAMPAGNE", String.valueOf(campagne.getId()),
                "SUCCES"
            );

            return campagne;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_CREATION_CAMPAGNE",
                "Échec de création : " + e.getMessage(),
                "CAMPAGNE",
                r == null || r.getExerciceId() == null
                    ? null : String.valueOf(r.getExerciceId()),
                "ECHEC"
            );
            throw e;
        }
    }

    @Transactional
    public CampagneBudgetaire creerApresBudget(
            CampagneApresBudgetRequest r,
            Integer auteurId
    ) {
        try {
            if (r == null || r.getExerciceId() == null
                    || r.getAnneeExercice() == null
                    || r.getDateVerification() == null
                    || r.getDateValidation() == null) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Exercice et échéances obligatoires"
                );
            }

            Integer nombre = jdbc.queryForObject(
                """
                SELECT COUNT(*)
                FROM exercice
                WHERE id = ? AND annee = ?
                """,
                Integer.class,
                r.getExerciceId(),
                r.getAnneeExercice()
            );

            if (nombre == null || nombre == 0) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Exercice introuvable ou année incohérente"
                );
            }

            boolean existe = campagnes.findAll().stream()
                .anyMatch(c ->
                    r.getExerciceId().equals(c.getExerciceId())
                );

            if (existe) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Une campagne existe déjà pour cet exercice"
                );
            }

            List<Map<String, Object>> budgets = jdbc.queryForList(
                """
                SELECT id, import_id, date_generation
                FROM budget
                WHERE exercice_id = ?
                  AND type_budget = 'GENERE'
                ORDER BY date_generation DESC NULLS LAST, id DESC
                LIMIT 1
                """,
                r.getExerciceId()
            );

            if (budgets.isEmpty()) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Générer d'abord le budget de cet exercice"
                );
            }

            Map<String, Object> budget = budgets.get(0);
            Object valeurGeneration = budget.get("date_generation");

            if (!(valeurGeneration instanceof Timestamp)) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Date de génération du budget indisponible"
                );
            }

            LocalDateTime dateGeneration =
                ((Timestamp) valeurGeneration).toLocalDateTime();

            Object valeurImport = budget.get("import_id");

            if (!(valeurImport instanceof Number)) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Le budget ne possède pas d'importation associée"
                );
            }

            Long importId = ((Number) valeurImport).longValue();

            List<LocalDateTime> imports = jdbc.query(
                """
                SELECT date_import
                FROM view_exercice
                WHERE id = ?
                  AND id_exercice = ?
                """,
                (rs, index) -> {
                    Timestamp timestamp = rs.getTimestamp("date_import");
                    return timestamp == null
                        ? null : timestamp.toLocalDateTime();
                },
                importId,
                r.getExerciceId()
            );

            if (imports.isEmpty() || imports.get(0) == null) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Date d'importation introuvable"
                );
            }

            LocalDateTime dateImportation = imports.get(0);

            if (dateImportation.isAfter(dateGeneration)) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "L'importation est postérieure à la génération"
                );
            }

            LocalDate dateVerification = r.getDateVerification();
            LocalDate dateValidation = r.getDateValidation();

            if (dateVerification.isBefore(dateGeneration.toLocalDate())) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "La vérification doit suivre la génération"
                );
            }

            if (dateValidation.isBefore(dateVerification)) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "La validation doit suivre la vérification"
                );
            }

            CampagneBudgetaire campagne = new CampagneBudgetaire();
            campagne.setNom("Campagne " + r.getAnneeExercice());
            campagne.setExerciceId(r.getExerciceId());
            campagne.setDateDebut(dateImportation.toLocalDate());
            campagne.setDateFin(dateValidation);
            campagne.setStatut("EN_COURS");

            campagne = campagnes.save(campagne);

            ajouterTermine(
                campagne.getId(), "Importation",
                "IMPORTATION", 1, dateImportation
            );

            ajouterTermine(
                campagne.getId(), "Génération du budget",
                "GENERATION", 2, dateGeneration
            );

            ajouter(
                campagne.getId(), "Vérification",
                "VERIFICATION", 3, dateVerification
            );

            ajouter(
                campagne.getId(), "Validation",
                "VALIDATION", 4, dateValidation
            );

            audit(
                auteurId, "CREATION_CAMPAGNE_APRES_BUDGET",
                "Création après génération : " + campagne.getNom(),
                "CAMPAGNE", String.valueOf(campagne.getId()),
                "SUCCES"
            );

            return campagne;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_CREATION_CAMPAGNE_APRES_BUDGET",
                "Échec de création après génération : "
                    + e.getMessage(),
                "CAMPAGNE",
                r == null || r.getExerciceId() == null
                    ? null : String.valueOf(r.getExerciceId()),
                "ECHEC"
            );
            throw e;
        }
    }


    public List<CampagneBudgetaire> lister() {
        return campagnes.findAllByOrderByDateDebutDesc();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> details(Long id) {
        CampagneBudgetaire campagne = trouver(id);

        List<JalonBudgetaire> liste =
            jalons.findByCampagneIdOrderByOrdreAsc(id);

        long termines = liste.stream()
            .filter(j -> "TERMINE".equals(j.getStatut()))
            .count();

        long retards = liste.stream()
            .filter(j -> !"TERMINE".equals(j.getStatut()))
            .filter(j -> j.getDateLimite().isBefore(LocalDate.now()))
            .count();

        double progression = liste.isEmpty()
            ? 0
            : Math.round(10000.0 * termines / liste.size()) / 100.0;

        Map<String, Object> resultat = new LinkedHashMap<>();
        resultat.put("campagne", campagne);
        resultat.put("jalons", liste);
        resultat.put("totalJalons", liste.size());
        resultat.put("jalonsTermines", termines);
        resultat.put("jalonsEnRetard", retards);
        resultat.put("progression", progression);

        return resultat;
    }

    @Transactional
    public CampagneBudgetaire modifier(
            Long id,
            CampagneRequest r,
            Integer auteurId
    ) {
        try {
            verifier(r);

            CampagneBudgetaire campagne = trouver(id);
            modifiable(campagne);

            if (!campagne.getExerciceId().equals(r.getExerciceId())) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "L'exercice ne peut pas être modifié"
                );
            }

            List<JalonBudgetaire> liste =
                jalons.findByCampagneIdOrderByOrdreAsc(id);

            boolean dejaCommencee = liste.stream()
                .anyMatch(j -> "TERMINE".equals(j.getStatut()));

            if (dejaCommencee) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Utilisez la modification individuelle des échéances"
                );
            }

            campagne.setNom(r.getNom().trim());
            campagne.setDateDebut(r.getDateDebut());
            campagne.setDateFin(r.getDateFin());

            Map<String, LocalDate> dates = Map.of(
                "IMPORTATION", r.getDateImportation(),
                "GENERATION", r.getDateGeneration(),
                "VERIFICATION", r.getDateVerification(),
                "VALIDATION", r.getDateValidation()
            );

            for (JalonBudgetaire jalon : liste) {
                LocalDate date = dates.get(jalon.getCode());
                if (date != null) {
                    jalon.setDateLimite(date);
                    jalons.save(jalon);
                }
            }

            CampagneBudgetaire resultat = campagnes.save(campagne);

            audit(
                auteurId, "MODIFICATION_CAMPAGNE",
                "Modification de la campagne " + id,
                "CAMPAGNE", String.valueOf(id), "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_MODIFICATION_CAMPAGNE",
                "Échec de modification : " + e.getMessage(),
                "CAMPAGNE", String.valueOf(id), "ECHEC"
            );
            throw e;
        }
    }


    @Transactional
    public JalonBudgetaire modifierJalon(
            Long campagneId,
            Long jalonId,
            JalonRequest r,
            Integer auteurId
    ) {
        try {
            CampagneBudgetaire campagne = trouver(campagneId);
            modifiable(campagne);

            JalonBudgetaire jalon = jalons.findById(jalonId)
                .orElseThrow(() -> erreur(
                    HttpStatus.NOT_FOUND, "Jalon introuvable"
                ));

            if (!campagneId.equals(jalon.getCampagneId())) {
                throw erreur(HttpStatus.NOT_FOUND, "Jalon hors campagne");
            }

            if (!Set.of("VERIFICATION", "VALIDATION")
                    .contains(jalon.getCode())) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "L'échéance de ce jalon est automatique"
                );
            }

            if ("TERMINE".equals(jalon.getStatut())) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Impossible de modifier un jalon terminé"
                );
            }

            if (r == null || r.getDateLimite() == null) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Date limite obligatoire"
                );
            }

            LocalDate nouvelleDate = r.getDateLimite();

            if (nouvelleDate.isBefore(campagne.getDateDebut())) {
                throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Date antérieure au début de la campagne"
                );
            }

            List<JalonBudgetaire> liste =
                jalons.findByCampagneIdOrderByOrdreAsc(campagneId);

            for (JalonBudgetaire autre : liste) {
                if (autre.getId().equals(jalonId)) continue;

                if (autre.getOrdre() < jalon.getOrdre()
                        && autre.getDateLimite().isAfter(nouvelleDate)) {
                    throw erreur(
                        HttpStatus.BAD_REQUEST,
                        "Échéance avant un jalon précédent"
                    );
                }

                if (autre.getOrdre() > jalon.getOrdre()
                        && autre.getDateLimite().isBefore(nouvelleDate)) {
                    throw erreur(
                        HttpStatus.BAD_REQUEST,
                        "Échéance après un jalon suivant"
                    );
                }
            }

            jalon.setDateLimite(nouvelleDate);

            if ("VALIDATION".equals(jalon.getCode())) {
                campagne.setDateFin(nouvelleDate);
                campagnes.save(campagne);
            }

            JalonBudgetaire resultat = jalons.save(jalon);

            audit(
                auteurId, "MODIFICATION_JALON",
                "Modification du jalon " + jalonId
                    + " de la campagne " + campagneId,
                "JALON", String.valueOf(jalonId), "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_MODIFICATION_JALON",
                "Échec de modification : " + e.getMessage(),
                "JALON", String.valueOf(jalonId), "ECHEC"
            );
            throw e;
        }
    }

    private void exiger(Long campagneId, String code) {
        JalonBudgetaire jalon = jalons
            .findByCampagneIdAndCode(campagneId, code)
            .orElseThrow(() -> erreur(
                HttpStatus.CONFLICT, "Jalon absent : " + code
            ));

        if (!"TERMINE".equals(jalon.getStatut())) {
            throw erreur(
                HttpStatus.CONFLICT,
                "Terminer d'abord le jalon : " + code
            );
        }
    }


    @Transactional
    public JalonBudgetaire terminerJalon(
            Long campagneId,
            Long jalonId,
            Integer auteurId
    ) {
        try {
            CampagneBudgetaire campagne = trouver(campagneId);
            modifiable(campagne);

            JalonBudgetaire jalon = jalons.findById(jalonId)
                .orElseThrow(() -> erreur(
                    HttpStatus.NOT_FOUND, "Jalon introuvable"
                ));

            if (!campagneId.equals(jalon.getCampagneId())) {
                throw erreur(HttpStatus.NOT_FOUND, "Jalon hors campagne");
            }

            if (!"VERIFICATION".equals(jalon.getCode())) {
                throw erreur(
                    HttpStatus.CONFLICT,
                    "Seule la vérification est confirmée ici"
                );
            }

            exiger(campagneId, "IMPORTATION");
            exiger(campagneId, "GENERATION");

            if (!"TERMINE".equals(jalon.getStatut())) {
                jalon.setStatut("TERMINE");
                jalon.setDateRealisation(LocalDateTime.now());
            }

            JalonBudgetaire resultat = jalons.save(jalon);

            audit(
                auteurId, "VERIFICATION_BUDGET",
                "Vérification de la campagne " + campagne.getNom(),
                "JALON", String.valueOf(jalonId), "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_VERIFICATION_BUDGET",
                "Échec de vérification : " + e.getMessage(),
                "JALON", String.valueOf(jalonId), "ECHEC"
            );
            throw e;
        }
    }


    @Transactional
    public CampagneBudgetaire validerCampagne(
            Long campagneId,
            Integer auteurId
    ) {
        try {
            CampagneBudgetaire campagne = trouver(campagneId);
            modifiable(campagne);

            exiger(campagneId, "IMPORTATION");
            exiger(campagneId, "GENERATION");
            exiger(campagneId, "VERIFICATION");

            JalonBudgetaire validation = jalons
                .findByCampagneIdAndCode(campagneId, "VALIDATION")
                .orElseThrow(() -> erreur(
                    HttpStatus.CONFLICT,
                    "Jalon VALIDATION introuvable"
                ));

            if (!"TERMINE".equals(validation.getStatut())) {
                validation.setStatut("TERMINE");
                validation.setDateRealisation(LocalDateTime.now());
                jalons.save(validation);
            }

            campagne.setStatut("TERMINEE");
            CampagneBudgetaire resultat = campagnes.save(campagne);

            audit(
                auteurId, "VALIDATION_CAMPAGNE",
                "Validation finale de la campagne " + campagne.getNom(),
                "CAMPAGNE", String.valueOf(campagneId), "SUCCES"
            );

            return resultat;

        } catch (RuntimeException e) {
            audit(
                auteurId, "ECHEC_VALIDATION_CAMPAGNE",
                "Échec de validation : " + e.getMessage(),
                "CAMPAGNE", String.valueOf(campagneId), "ECHEC"
            );
            throw e;
        }
    }
}
