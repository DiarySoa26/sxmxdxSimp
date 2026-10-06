package com.sxmxdx.backend.dto.prediction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PredictionDTO {
    private Long id;
    private Integer annee;
    private Integer anneeReference;
    private String typeBudget;
    private String statut;
    private String modele;
    private BigDecimal caExport;
    private BigDecimal chargesExploitation;
    private BigDecimal fraisExport;
    private BigDecimal masseSalariale;
    private BigDecimal resultatOperationnel;
    private BigDecimal margeOperationnelle;
    private LocalDateTime dateGeneration;
    private String resume;
    private List<PredictionMensuelleDTO> mois;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }
    public Integer getAnneeReference() { return anneeReference; }
    public void setAnneeReference(Integer anneeReference) { this.anneeReference = anneeReference; }
    public String getTypeBudget() { return typeBudget; }
    public void setTypeBudget(String typeBudget) { this.typeBudget = typeBudget; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
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
    public LocalDateTime getDateGeneration() { return dateGeneration; }
    public void setDateGeneration(LocalDateTime dateGeneration) { this.dateGeneration = dateGeneration; }
    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }
    public List<PredictionMensuelleDTO> getMois() { return mois; }
    public void setMois(List<PredictionMensuelleDTO> mois) { this.mois = mois; }
}