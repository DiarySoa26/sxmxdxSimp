package com.sxmxdx.backend.service;

import com.sxmxdx.backend.dto.LoginResponse;
import com.sxmxdx.backend.entity.JournalConnexion;
import com.sxmxdx.backend.entity.Utilisateur;
import com.sxmxdx.backend.repository.JournalConnexionRepository;
import com.sxmxdx.backend.repository.UtilisateurRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UtilisateurRepository
        utilisateurRepository;

    private final JournalConnexionRepository
        journalConnexionRepository;

    private final BCryptPasswordEncoder
        passwordEncoder;


    public AuthService(
        UtilisateurRepository utilisateurRepository,
        JournalConnexionRepository journalConnexionRepository,
        BCryptPasswordEncoder passwordEncoder
    ) {

        this.utilisateurRepository =
            utilisateurRepository;

        this.journalConnexionRepository =
            journalConnexionRepository;

        this.passwordEncoder =
            passwordEncoder;
    }


    public LoginResponse login(
        String email,
        String password
    ) {

        if (
            email == null ||
            email.isBlank() ||
            password == null ||
            password.isBlank()
        ) {

            return new LoginResponse(
                false,
                "Email et mot de passe obligatoires.",
                null,
                null,
                null,
                null
            );
        }

        Optional<Utilisateur> resultat =
            utilisateurRepository
                .findByEmailIgnoreCase(
                    email.trim()
                );


        if (resultat.isEmpty()) {

            return new LoginResponse(
                false,
                "Email ou mot de passe incorrect.",
                null,
                null,
                null,
                null
            );
        }


        Utilisateur utilisateur =
            resultat.get();


        if (
            utilisateur.getActif() == null ||
            !utilisateur.getActif()
        ) {

            enregistrerConnexion(
                utilisateur,
                false
            );

            return new LoginResponse(
                false,
                "Ce compte est désactivé.",
                null,
                null,
                null,
                null
            );
        }

        boolean motDePasseValide =
            passwordEncoder.matches(
                password,
                utilisateur.getMotDePasse()
            );


        if (!motDePasseValide) {

            enregistrerConnexion(
                utilisateur,
                false
            );

            return new LoginResponse(
                false,
                "Email ou mot de passe incorrect.",
                null,
                null,
                null,
                null
            );
        }


        utilisateur.setDerniereConnexion(
            LocalDateTime.now()
        );

        utilisateurRepository.save(
            utilisateur
        );


        enregistrerConnexion(
            utilisateur,
            true
        );


        String nomComplet =
            (
                (
                    utilisateur.getPrenom() != null
                        ? utilisateur.getPrenom()
                        : ""
                )
                +
                " "
                +
                utilisateur.getNom()
            ).trim();


        return new LoginResponse(
            true,
            "Connexion réussie.",
            utilisateur.getId(),
            nomComplet,
            utilisateur.getEmail(),
            utilisateur
                .getRole()
                .getNom()
        );
    }


    private void enregistrerConnexion(
        Utilisateur utilisateur,
        boolean succes
    ) {

        JournalConnexion journal =
            new JournalConnexion();

        journal.setUtilisateur(
            utilisateur
        );

        journal.setSucces(
            succes
        );

        journal.setDateConnexion(
            LocalDateTime.now()
        );

        journalConnexionRepository.save(
            journal
        );
    }
}