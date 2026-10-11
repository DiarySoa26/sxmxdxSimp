package com.sxmxdx.backend.dto.campagne;

import java.time.LocalDate;

public class JalonRequest {

    private LocalDate dateLimite;

    public JalonRequest() {}

    public LocalDate getDateLimite() { return dateLimite; }
    public void setDateLimite(LocalDate dateLimite) {
        this.dateLimite = dateLimite;
    }
}