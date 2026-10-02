package com.sxmxdx.backend.repository.exercice;

import com.sxmxdx.backend.entity.exercice.ExerciceView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciceRepository extends JpaRepository<ExerciceView, Integer> {

    // Tous les exercices
    @Query(
        value = """
            SELECT *
            FROM view_exercice
            ORDER BY annee_exercice DESC
        """,
        nativeQuery = true
    )
    List<ExerciceView> rechercherTous();

    // Recherche par année
    @Query(
        value = """
            SELECT *
            FROM view_exercice
            WHERE annee_exercice = :annee
            ORDER BY annee_exercice DESC
        """,
        nativeQuery = true
    )
    List<ExerciceView> rechercherParAnnee(
        @Param("annee") Integer annee
    );

    // Liste des années disponibles
    @Query(
        value = """
            SELECT DISTINCT annee_exercice
            FROM view_exercice
            WHERE annee_exercice IS NOT NULL
            ORDER BY annee_exercice DESC
        """,
        nativeQuery = true
    )
    List<Integer> rechercherAnnees();
}