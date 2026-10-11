// package com.sxmxdx.backend.service.campagne;

// import com.sxmxdx.backend.dto.campagne.*;
// import com.sxmxdx.backend.entity.campagne.*;
// import com.sxmxdx.backend.repository.campagne.*;

// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.server.ResponseStatusException;

// import java.time.*;
// import java.util.*;

// @Service
// public class CampagneBudgetaireService {

//     private final CampagneBudgetaireRepository campagnes;
//     private final JalonBudgetaireRepository jalons;

//     public CampagneBudgetaireService(
//         CampagneBudgetaireRepository campagnes,
//         JalonBudgetaireRepository jalons
//     ) {
//         this.campagnes = campagnes;
//         this.jalons = jalons;
//     }

//     private ResponseStatusException erreur(HttpStatus statut, String message) {
//         return new ResponseStatusException(statut, message);
//     }

//     private CampagneBudgetaire trouver(Long id) {
//         return campagnes.findById(id).orElseThrow(() ->
//             erreur(HttpStatus.NOT_FOUND, "Campagne introuvable")
//         );
//     }

//     private void verifierModifiable(CampagneBudgetaire c) {
//         if ("TERMINEE".equals(c.getStatut()) || "ANNULEE".equals(c.getStatut()))
//             throw erreur(HttpStatus.CONFLICT, "Campagne non modifiable");
//     }

//     private void valider(CampagneRequest r) {
//         if (r == null || r.getNom() == null || r.getNom().isBlank()
//             || r.getExerciceId() == null
//             || r.getDateDebut() == null || r.getDateFin() == null
//             || r.getDateImportation() == null || r.getDateGeneration() == null
//             || r.getDateVerification() == null || r.getDateCloture() == null)
//             throw erreur(HttpStatus.BAD_REQUEST, "Informations incomplètes");

//         LocalDate precedente = r.getDateDebut();
//         for (LocalDate date : List.of(
//             r.getDateImportation(), r.getDateGeneration(),
//             r.getDateVerification(), r.getDateCloture()
//         )) {
//             if (date.isBefore(precedente) || date.isAfter(r.getDateFin()))
//                 throw erreur(HttpStatus.BAD_REQUEST, "Dates de planification invalides");
//             precedente = date;
//         }
//     }

//     private void ajouterJalon(Long campagneId, String nom,
//                               String code, int ordre, LocalDate date) {
//         JalonBudgetaire j = new JalonBudgetaire();
//         j.setCampagneId(campagneId);
//         j.setNom(nom);
//         j.setCode(code);
//         j.setOrdre(ordre);
//         j.setDateLimite(date);
//         j.setStatut("EN_ATTENTE");
//         jalons.save(j);
//     }

//     @Transactional
//     public CampagneBudgetaire creer(CampagneRequest r) {
//         valider(r);

//         CampagneBudgetaire c = new CampagneBudgetaire();
//         c.setNom(r.getNom());
//         c.setExerciceId(r.getExerciceId());
//         c.setDateDebut(r.getDateDebut());
//         c.setDateFin(r.getDateFin());
//         c.setStatut("PLANIFIEE");
//         c = campagnes.save(c);

//         ajouterJalon(c.getId(), "Importation", "IMPORTATION", 1, r.getDateImportation());
//         ajouterJalon(c.getId(), "Génération", "GENERATION", 2, r.getDateGeneration());
//         ajouterJalon(c.getId(), "Vérification", "VERIFICATION", 3, r.getDateVerification());
//         ajouterJalon(c.getId(), "Clôture", "CLOTURE", 4, r.getDateCloture());

//         return c;
//     }

//     public List<CampagneBudgetaire> lister() {
//         return campagnes.findAllByOrderByDateDebutDesc();
//     }

//     public Map<String, Object> details(Long id) {
//         CampagneBudgetaire c = trouver(id);
//         List<JalonBudgetaire> liste = jalons.findByCampagneIdOrderByOrdreAsc(id);

//         long termines = liste.stream()
//             .filter(j -> "TERMINE".equals(j.getStatut())).count();

//         long retards = liste.stream()
//             .filter(j -> !"TERMINE".equals(j.getStatut()))
//             .filter(j -> j.getDateLimite().isBefore(LocalDate.now())).count();

//         double progression = liste.isEmpty() ? 0 :
//             Math.round(termines * 10000.0 / liste.size()) / 100.0;

//         Map<String, Object> resultat = new LinkedHashMap<>();
//         resultat.put("campagne", c);
//         resultat.put("jalons", liste);
//         resultat.put("totalJalons", liste.size());
//         resultat.put("jalonsTermines", termines);
//         resultat.put("jalonsEnRetard", retards);
//         resultat.put("progression", progression);

//         return resultat;
//     }

//     @Transactional
//     public CampagneBudgetaire modifier(Long id, CampagneRequest r) {
//         valider(r);
//         CampagneBudgetaire c = trouver(id);
//         verifierModifiable(c);

//         if (!c.getExerciceId().equals(r.getExerciceId()))
//             throw erreur(HttpStatus.CONFLICT, "Impossible de changer l'exercice d'une campagne");

//         c.setNom(r.getNom());
//         c.setDateDebut(r.getDateDebut());
//         c.setDateFin(r.getDateFin());

//         Map<String, LocalDate> dates = Map.of(
//             "IMPORTATION", r.getDateImportation(),
//             "GENERATION", r.getDateGeneration(),
//             "VERIFICATION", r.getDateVerification(),
//             "CLOTURE", r.getDateCloture()
//         );

//         for (JalonBudgetaire j : jalons.findByCampagneIdOrderByOrdreAsc(id)) {
//             LocalDate date = dates.get(j.getCode());
//             if (date != null) j.setDateLimite(date);
//         }

//         return campagnes.save(c);
//     }

//     @Transactional
//     public JalonBudgetaire modifierJalon(Long id, Long jalonId, JalonRequest r) {
//         CampagneBudgetaire c = trouver(id);
//         verifierModifiable(c);

//         JalonBudgetaire j = jalons.findById(jalonId).orElseThrow(() ->
//             erreur(HttpStatus.NOT_FOUND, "Jalon introuvable")
//         );

//         if (!id.equals(j.getCampagneId()))
//             throw erreur(HttpStatus.NOT_FOUND, "Jalon hors campagne");

//         if (r == null || r.getDateLimite() == null
//             || r.getDateLimite().isBefore(c.getDateDebut())
//             || r.getDateLimite().isAfter(c.getDateFin()))
//             throw erreur(HttpStatus.BAD_REQUEST, "Date limite invalide");

//         List<JalonBudgetaire> liste = jalons.findByCampagneIdOrderByOrdreAsc(id);
//         for (JalonBudgetaire autre : liste) {
//             if (autre.getId().equals(jalonId)) continue;
//             if (autre.getOrdre() < j.getOrdre()
//                 && autre.getDateLimite().isAfter(r.getDateLimite()))
//                 throw erreur(HttpStatus.BAD_REQUEST, "Date antérieure au jalon précédent");
//             if (autre.getOrdre() > j.getOrdre()
//                 && autre.getDateLimite().isBefore(r.getDateLimite()))
//                 throw erreur(HttpStatus.BAD_REQUEST, "Date postérieure au jalon suivant");
//         }

//         j.setDateLimite(r.getDateLimite());
//         return jalons.save(j);
//     }

//     @Transactional
//     public JalonBudgetaire terminerJalon(Long id, Long jalonId) {
//         CampagneBudgetaire c = trouver(id);
//         verifierModifiable(c);

//         JalonBudgetaire j = jalons.findById(jalonId).orElseThrow(() ->
//             erreur(HttpStatus.NOT_FOUND, "Jalon introuvable")
//         );

//         if (!id.equals(j.getCampagneId()))
//             throw erreur(HttpStatus.NOT_FOUND, "Jalon hors campagne");

//         if (!"VERIFICATION".equals(j.getCode()))
//             throw erreur(HttpStatus.CONFLICT, "Ce jalon n'est pas validable manuellement");

//         if (!"TERMINE".equals(j.getStatut())) {
//             j.setStatut("TERMINE");
//             j.setDateRealisation(LocalDateTime.now());
//         }

//         if ("PLANIFIEE".equals(c.getStatut())) {
//             c.setStatut("EN_COURS");
//             campagnes.save(c);
//         }

//         return jalons.save(j);
//     }

//     @Transactional
//     public CampagneBudgetaire cloturer(Long id) {
//         CampagneBudgetaire c = trouver(id);
//         verifierModifiable(c);

//         JalonBudgetaire j = jalons.findByCampagneIdAndCode(id, "CLOTURE")
//             .orElseThrow(() ->
//                 erreur(HttpStatus.NOT_FOUND, "Jalon de clôture introuvable")
//             );

//         j.setStatut("TERMINE");
//         if (j.getDateRealisation() == null)
//             j.setDateRealisation(LocalDateTime.now());

//         jalons.save(j);
//         c.setStatut("TERMINEE");
//         return campagnes.save(c);
//     }
// }




package com.sxmxdx.backend.service.campagne;

import com.sxmxdx.backend.dto.campagne.*;
import com.sxmxdx.backend.entity.campagne.*;
import com.sxmxdx.backend.repository.campagne.*;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public CampagneBudgetaireService(
        CampagneBudgetaireRepository campagnes,
        JalonBudgetaireRepository jalons,
        JdbcTemplate jdbc
    ) {
        this.campagnes = campagnes;
        this.jalons = jalons;
        this.jdbc = jdbc;
    }

    private ResponseStatusException erreur(HttpStatus status, String message) {
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
            || r.getExerciceId() == null || r.getDateDebut() == null
            || r.getDateFin() == null || r.getDateImportation() == null
            || r.getDateGeneration() == null
            || r.getDateVerification() == null
            || r.getDateValidation() == null) {
            throw erreur(HttpStatus.BAD_REQUEST, "Champs obligatoires manquants");
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

    // Création classique, conservée pour compatibilité.
    @Transactional
    public CampagneBudgetaire creer(CampagneRequest r) {
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

        return campagne;
    }

    // Création de campagne après génération du budget.
    @Transactional
    public CampagneBudgetaire creerApresBudget(CampagneApresBudgetRequest r) {

        if (r == null || r.getExerciceId() == null
            || r.getAnneeExercice() == null
            || r.getDateVerification() == null
            || r.getDateValidation() == null) {
            throw erreur(
                HttpStatus.BAD_REQUEST,
                "Exercice et échéances obligatoires"
            );
        }

        // Vérifier la correspondance exercice / année.
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

        // Éviter plusieurs campagnes pour le même exercice.
        boolean existe = campagnes.findAll().stream()
            .anyMatch(c -> r.getExerciceId().equals(c.getExerciceId()));

        if (existe) {
            throw erreur(
                HttpStatus.CONFLICT,
                "Une campagne existe déjà pour cet exercice"
            );
        }

        // Retrouver le dernier budget généré de l'exercice.
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

        // Retrouver la date d'importation associée au budget.
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
                return timestamp == null ? null : timestamp.toLocalDateTime();
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

        // Création de la campagne.
        CampagneBudgetaire campagne = new CampagneBudgetaire();

        campagne.setNom("Campagne " + r.getAnneeExercice());
        campagne.setExerciceId(r.getExerciceId());
        campagne.setDateDebut(dateImportation.toLocalDate());
        campagne.setDateFin(dateValidation);
        campagne.setStatut("EN_COURS");

        campagne = campagnes.save(campagne);

        // Deux jalons déjà réalisés.
        ajouterTermine(
            campagne.getId(),
            "Importation",
            "IMPORTATION",
            1,
            dateImportation
        );

        ajouterTermine(
            campagne.getId(),
            "Génération du budget",
            "GENERATION",
            2,
            dateGeneration
        );

        // Deux jalons restant à effectuer.
        ajouter(
            campagne.getId(),
            "Vérification",
            "VERIFICATION",
            3,
            dateVerification
        );

        ajouter(
            campagne.getId(),
            "Validation",
            "VALIDATION",
            4,
            dateValidation
        );

        return campagne;
    }

    // Liste des campagnes.
    public List<CampagneBudgetaire> lister() {
        return campagnes.findAllByOrderByDateDebutDesc();
    }

    // Détails et statistiques.
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

    // Modification de la campagne.
    @Transactional
    public CampagneBudgetaire modifier(Long id, CampagneRequest r) {

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

        return campagnes.save(campagne);
    }

    // Modifier uniquement les échéances non réalisées.
    @Transactional
    public JalonBudgetaire modifierJalon(
        Long campagneId,
        Long jalonId,
        JalonRequest r
    ) {

        CampagneBudgetaire campagne = trouver(campagneId);
        modifiable(campagne);

        JalonBudgetaire jalon = jalons.findById(jalonId)
            .orElseThrow(() -> erreur(
                HttpStatus.NOT_FOUND,
                "Jalon introuvable"
            ));

        if (!campagneId.equals(jalon.getCampagneId())) {
            throw erreur(HttpStatus.NOT_FOUND, "Jalon hors campagne");
        }

        if (!Set.of("VERIFICATION", "VALIDATION").contains(jalon.getCode())) {
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

        // La date de fin suit la validation.
        if ("VALIDATION".equals(jalon.getCode())) {
            campagne.setDateFin(nouvelleDate);
            campagnes.save(campagne);
        }

        return jalons.save(jalon);
    }

    private void exiger(Long campagneId, String code) {

        JalonBudgetaire jalon = jalons
            .findByCampagneIdAndCode(campagneId, code)
            .orElseThrow(() -> erreur(
                HttpStatus.CONFLICT,
                "Jalon absent : " + code
            ));

        if (!"TERMINE".equals(jalon.getStatut())) {
            throw erreur(
                HttpStatus.CONFLICT,
                "Terminer d'abord le jalon : " + code
            );
        }
    }

    // Vérification manuelle.
    @Transactional
    public JalonBudgetaire terminerJalon(Long campagneId, Long jalonId) {

        CampagneBudgetaire campagne = trouver(campagneId);
        modifiable(campagne);

        JalonBudgetaire jalon = jalons.findById(jalonId)
            .orElseThrow(() -> erreur(
                HttpStatus.NOT_FOUND,
                "Jalon introuvable"
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

        return jalons.save(jalon);
    }

    // Validation finale.
    @Transactional
    public CampagneBudgetaire validerCampagne(Long campagneId) {

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

        return campagnes.save(campagne);
    }
}
