package com.sxmxdx.backend.service;

import com.sxmxdx.backend.dto.UtilisateurRequest;
import com.sxmxdx.backend.dto.UtilisateurModificationRequest;
import com.sxmxdx.backend.entity.Role;
import com.sxmxdx.backend.entity.Utilisateur;
import com.sxmxdx.backend.repository.RoleRepository;
import com.sxmxdx.backend.repository.UtilisateurRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurs;
    private final RoleRepository roles;
    private final BCryptPasswordEncoder encoder;
    private final JournalAuditService journalAuditService;

    private static final Set<String> ROLES =
            Set.of("ADMIN", "DAF", "COMPTABLE", "LECTEUR");

    public UtilisateurService(
            UtilisateurRepository utilisateurs,
            RoleRepository roles,
            BCryptPasswordEncoder encoder,
            JournalAuditService journalAuditService
    ) {
        this.utilisateurs = utilisateurs;
        this.roles = roles;
        this.encoder = encoder;
        this.journalAuditService = journalAuditService;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> lister() {
        return utilisateurs.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public Map<String, Object> creer(
            UtilisateurRequest req,
            Integer auteurId
    ) {
        if (req == null) {
            throw erreur(HttpStatus.BAD_REQUEST, "Requête invalide.");
        }

        String nom = verifierNom(req.getNom());
        String email = verifierEmail(req.getEmail());
        Role role = trouverRole(req.getRole());
        String motDePasse = req.getMotDePasse();

        if (motDePasse == null) {
            throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Veuillez renseigner le mot de passe"
            );
        }

        verifierEmailDisponible(email, null);

        Utilisateur u = new Utilisateur();
        u.setNom(nom);
        u.setPrenom(req.getPrenom() == null ? "" : req.getPrenom().trim());
        u.setEmail(email);
        u.setMotDePasse(encoder.encode(motDePasse));
        u.setRole(role);
        u.setActif(true);
        u.setDateCreation(LocalDateTime.now());

        Utilisateur enregistre = utilisateurs.save(u);

        journalAuditService.enregistrer(
                auteurId,
                "CREATION_UTILISATEUR",
                "UTILISATEURS",
                "Création de l'utilisateur : " + enregistre.getEmail(),
                "UTILISATEUR",
                String.valueOf(enregistre.getId()),
                "SUCCES"
        );

        return toDto(enregistre);
    }

    @Transactional
    public Map<String, Object> modifier(
            Integer id,
            UtilisateurModificationRequest req,
            Integer auteurId
    ) {
        Utilisateur u = trouverUtilisateur(id);

        if (req == null) {
            throw erreur(HttpStatus.BAD_REQUEST, "Requête invalide.");
        }

        String nom = verifierNom(req.getNom());
        String email = verifierEmail(req.getEmail());
        Role role = trouverRole(req.getRole());

        verifierEmailDisponible(email, id);

        String ancienEmail = u.getEmail();

        u.setNom(nom);
        u.setPrenom(req.getPrenom() == null ? "" : req.getPrenom().trim());
        u.setEmail(email);
        u.setRole(role);

        String nouveauMotDePasse = req.getMotDePasse();

        if (nouveauMotDePasse != null && !nouveauMotDePasse.isEmpty()) {
            if (nouveauMotDePasse.length() < 12) {
                throw erreur(
                        HttpStatus.BAD_REQUEST,
                        "Le nouveau mot de passe doit contenir au moins 12 caractères."
                );
            }

            u.setMotDePasse(encoder.encode(nouveauMotDePasse));
        }

        Utilisateur enregistre = utilisateurs.save(u);

        journalAuditService.enregistrer(
                auteurId,
                "MODIFICATION_UTILISATEUR",
                "UTILISATEURS",
                "Modification de l'utilisateur : " + ancienEmail
                        + " → " + enregistre.getEmail(),
                "UTILISATEUR",
                String.valueOf(enregistre.getId()),
                "SUCCES"
        );

        return toDto(enregistre);
    }

    @Transactional
    public Map<String, Object> changerStatut(
            Integer id,
            boolean actif,
            Integer auteurId
    ) {
        Utilisateur u = trouverUtilisateur(id);

        boolean ancienStatut = Boolean.TRUE.equals(u.getActif());

        if (ancienStatut == actif) {
            return toDto(u);
        }

        u.setActif(actif);

        Utilisateur enregistre = utilisateurs.save(u);

        journalAuditService.enregistrer(
                auteurId,
                actif
                        ? "ACTIVATION_UTILISATEUR"
                        : "DESACTIVATION_UTILISATEUR",
                "UTILISATEURS",
                (actif
                        ? "Activation du compte : "
                        : "Désactivation du compte : ")
                        + enregistre.getEmail(),
                "UTILISATEUR",
                String.valueOf(enregistre.getId()),
                "SUCCES"
        );

        return toDto(enregistre);
    }

    private Utilisateur trouverUtilisateur(Integer id) {
        return utilisateurs.findById(id)
                .orElseThrow(() -> erreur(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable."
                ));
    }

    private Role trouverRole(String nomRole) {
        if (nomRole == null ||
                !ROLES.contains(nomRole.trim().toUpperCase())) {
            throw erreur(HttpStatus.BAD_REQUEST, "Rôle invalide.");
        }

        return roles.findByNomIgnoreCase(nomRole.trim())
                .orElseThrow(() -> erreur(
                        HttpStatus.BAD_REQUEST,
                        "Rôle inexistant dans PostgreSQL."
                ));
    }

    private String verifierNom(String nom) {
        if (nom == null || nom.isBlank()) {
            throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Le nom est obligatoire."
            );
        }

        return nom.trim();
    }

    private String verifierEmail(String email) {
        if (email == null || email.isBlank()) {
            throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "L'email est obligatoire."
            );
        }

        String valeur = email.trim().toLowerCase();

        if (!valeur.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw erreur(
                    HttpStatus.BAD_REQUEST,
                    "Adresse email invalide."
            );
        }

        return valeur;
    }

    private void verifierEmailDisponible(
            String email,
            Integer idActuel
    ) {
        utilisateurs.findByEmailIgnoreCase(email).ifPresent(u -> {
            if (idActuel == null || !u.getId().equals(idActuel)) {
                throw erreur(
                        HttpStatus.CONFLICT,
                        "Cet email est déjà utilisé."
                );
            }
        });
    }

    private ResponseStatusException erreur(
            HttpStatus status,
            String message
    ) {
        return new ResponseStatusException(status, message);
    }

    private Map<String, Object> toDto(Utilisateur u) {
        return Map.of(
                "id", u.getId(),
                "nom", u.getNom(),
                "prenom", u.getPrenom() == null ? "" : u.getPrenom(),
                "email", u.getEmail(),
                "role", u.getRole().getNom(),
                "actif", Boolean.TRUE.equals(u.getActif())
        );
    }
}
