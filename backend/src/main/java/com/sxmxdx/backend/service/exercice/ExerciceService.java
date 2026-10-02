package com.sxmxdx.backend.service.exercice;

import com.sxmxdx.backend.dto.exercice.ExerciceDTO;
import com.sxmxdx.backend.entity.exercice.ExerciceView;
import com.sxmxdx.backend.repository.exercice.ExerciceRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciceService {

    private final ExerciceRepository repository;

    public ExerciceService(
        ExerciceRepository repository
    ) {
        this.repository = repository;
    }

    public List<ExerciceDTO> rechercher(Integer annee) {

        List<ExerciceView> exercices;

        if (annee == null) {
            exercices = repository.rechercherTous();
        } else {
            exercices = repository.rechercherParAnnee(annee);
        }

        return exercices.stream()
            .map(this::convertir)
            .toList();
    }

    public List<Integer> rechercherAnnees() {

        return repository.rechercherAnnees();
    }

    private ExerciceDTO convertir(
        ExerciceView exercice
    ) {

        ExerciceDTO dto = new ExerciceDTO();

        dto.setIdExercice(
            exercice.getIdExercice()
        );

        dto.setAnneeExercice(
            exercice.getAnneeExercice()
        );

        dto.setIdImportFichier(
            exercice.getIdImportFichier()
        );

        dto.setNomFichier(
            exercice.getNomFichier()
        );

        dto.setExerciceId(
            exercice.getExerciceId()
        );

        dto.setStatut(
            exercice.getStatut()
        );

        dto.setDateImport(
            exercice.getDateImport()
        );

        dto.setMessageErreur(
            exercice.getMessageErreur()
        );

        return dto;
    }
}