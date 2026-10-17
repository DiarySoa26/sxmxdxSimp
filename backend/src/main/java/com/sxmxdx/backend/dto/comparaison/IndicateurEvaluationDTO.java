
package com.sxmxdx.backend.dto.comparaison;

import java.math.BigDecimal;

public class IndicateurEvaluationDTO {

    private String code;
    private String libelle;
    private String unite;

    private BigDecimal constate;
    private BigDecimal prevision;
    private BigDecimal ecart;
    private BigDecimal erreurAbsolue;
    private BigDecimal erreurPourcentage;

    private String diagnostic;

    public IndicateurEvaluationDTO(
            String code,
            String libelle,
            String unite,
            BigDecimal constate,
            BigDecimal prevision,
            BigDecimal ecart,
            BigDecimal erreurAbsolue,
            BigDecimal erreurPourcentage,
            String diagnostic
    ) {
        this.code = code;
        this.libelle = libelle;
        this.unite = unite;
        this.constate = constate;
        this.prevision = prevision;
        this.ecart = ecart;
        this.erreurAbsolue = erreurAbsolue;
        this.erreurPourcentage = erreurPourcentage;
        this.diagnostic = diagnostic;
    }

    public String getCode() {
        return code;
    }

    public String getLibelle() {
        return libelle;
    }

    public String getUnite() {
        return unite;
    }

    public BigDecimal getConstate() {
        return constate;
    }

    public BigDecimal getPrevision() {
        return prevision;
    }

    public BigDecimal getEcart() {
        return ecart;
    }

    public BigDecimal getErreurAbsolue() {
        return erreurAbsolue;
    }

    public BigDecimal getErreurPourcentage() {
        return erreurPourcentage;
    }

    public String getDiagnostic() {
        return diagnostic;
    }
}
