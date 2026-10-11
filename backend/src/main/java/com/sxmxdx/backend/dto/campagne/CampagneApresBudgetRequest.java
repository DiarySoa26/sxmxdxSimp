package com.sxmxdx.backend.dto.campagne;

import java.time.LocalDate;

public class CampagneApresBudgetRequest {

    private Long exerciceId;
    private Integer anneeExercice;
    private LocalDate dateVerification;
    private LocalDate dateValidation;

    public Long getExerciceId() { return exerciceId; }
    public void setExerciceId(Long v) { exerciceId = v; }

    public Integer getAnneeExercice() { return anneeExercice; }
    public void setAnneeExercice(Integer v) { anneeExercice = v; }

    public LocalDate getDateVerification() { return dateVerification; }
    public void setDateVerification(LocalDate v) { dateVerification = v; }

    public LocalDate getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDate v) { dateValidation = v; }
}