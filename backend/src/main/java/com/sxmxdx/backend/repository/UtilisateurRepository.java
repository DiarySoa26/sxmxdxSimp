package com.sxmxdx.backend.repository;

import com.sxmxdx.backend.entity.Utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository
        extends JpaRepository<Utilisateur, Integer> {

    Optional<Utilisateur>
        findByEmailIgnoreCase(String email);
}