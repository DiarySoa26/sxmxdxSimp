package com.sxmxdx.backend.dto.prediction;

import java.math.BigDecimal;

public class PredictionMensuelleDTO {
    private Integer mois;
    private BigDecimal ventes;
    private BigDecimal production;
    private BigDecimal caExport;
    private BigDecimal chargesExploitation;
    private BigDecimal fraisExport;
    private BigDecimal masseSalariale;
    private BigDecimal resultatOperationnel;
    private BigDecimal margeOperationnelle;

    public Integer getMois() { return mois; }
    public void setMois(Integer mois) { this.mois = mois; }
    public BigDecimal getVentes() { return ventes; }
    public void setVentes(BigDecimal ventes) { this.ventes = ventes; }
    public BigDecimal getProduction() { return production; }
    public void setProduction(BigDecimal production) { this.production = production; }
    public BigDecimal getCaExport() { return caExport; }
    public void setCaExport(BigDecimal caExport) { this.caExport = caExport; }
    public BigDecimal getChargesExploitation() { return chargesExploitation; }
    public void setChargesExploitation(BigDecimal chargesExploitation) { this.chargesExploitation = chargesExploitation; }
    public BigDecimal getFraisExport() { return fraisExport; }
    public void setFraisExport(BigDecimal fraisExport) { this.fraisExport = fraisExport; }
    public BigDecimal getMasseSalariale() { return masseSalariale; }
    public void setMasseSalariale(BigDecimal masseSalariale) { this.masseSalariale = masseSalariale; }
    public BigDecimal getResultatOperationnel() { return resultatOperationnel; }
    public void setResultatOperationnel(BigDecimal resultatOperationnel) { this.resultatOperationnel = resultatOperationnel; }
    public BigDecimal getMargeOperationnelle() { return margeOperationnelle; }
    public void setMargeOperationnelle(BigDecimal margeOperationnelle) { this.margeOperationnelle = margeOperationnelle; }
}