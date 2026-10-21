
package com.sxmxdx.backend.service.budgetdetails;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompteResultatCalculService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private static final List<String> CODES = List.of(
            "CA",
            "STOCK",
            "IMMOB",
            "ACHATS",
            "SERVICES",
            "SUBVENTIONS",
            "TAXES",
            "PERSONNEL",
            "AUTRES_PRODUITS",
            "AUTRES_CHARGES",
            "AMORTISSEMENTS",
            "PROVISIONS",
            "REPRISES",
            "PRODUITS_FIN",
            "CHARGES_FIN",
            "IMPOT",
            "IMPOTS_DIFFERES",
            "EXTRA_PRODUITS",
            "EXTRA_CHARGES"
    );

    
private BigDecimal[] lire(
        Map<String, BigDecimal[]> donnees,
        String code
) {
    BigDecimal[] resultat = new BigDecimal[12];

    Arrays.fill(resultat, BigDecimal.ZERO);

    if (donnees == null) {
        return resultat;
    }

    BigDecimal[] valeurs = donnees.get(code);

    // Rubrique absente : 0 pour les 12 mois
    if (valeurs == null) {
        return resultat;
    }
    
    for (int i = 0; i < Math.min(valeurs.length, 12); i++) {
        if (valeurs[i] != null) {
            resultat[i] = valeurs[i];
        }
    }

    return resultat;
}


    private BigDecimal[] additionner(
            BigDecimal[] a,
            BigDecimal[] b
    ) {
        BigDecimal[] resultat = new BigDecimal[12];

        for (int i = 0; i < 12; i++) {
            resultat[i] = a[i].add(b[i]);
        }

        return resultat;
    }

    private BigDecimal[] soustraire(
            BigDecimal[] a,
            BigDecimal[] b
    ) {
        BigDecimal[] resultat = new BigDecimal[12];

        for (int i = 0; i < 12; i++) {
            resultat[i] = a[i].subtract(b[i]);
        }

        return resultat;
    }

    private BigDecimal somme(BigDecimal[] valeurs) {
        BigDecimal resultat = ZERO;

        for (BigDecimal valeur : valeurs) {
            resultat = resultat.add(valeur);
        }

        return resultat;
    }

    private void ajouterLigne(
            List<Map<String, Object>> lignes,
            String code,
            String rubrique,
            BigDecimal[] mensuel,
            String type
    ) {
        Map<String, Object> ligne = new LinkedHashMap<>();

        ligne.put("code", code);
        ligne.put("rubrique", rubrique);
        ligne.put("mensuel", Arrays.asList(mensuel));
        ligne.put("totalAnnuel", somme(mensuel));
        ligne.put("type", type);
        ligne.put("format", "montant");

        lignes.add(ligne);
    }

    public List<Map<String, Object>> calculerCompteResultat(
            Map<String, BigDecimal[]> donnees
    ) {
        for (String code : CODES) {
            lire(donnees, code);
        }

        List<Map<String, Object>> lignes = new ArrayList<>();

        BigDecimal[] ca = lire(donnees, "CA");
        BigDecimal[] stock = lire(donnees, "STOCK");
        BigDecimal[] immob = lire(donnees, "IMMOB");
        BigDecimal[] achats = lire(donnees, "ACHATS");
        BigDecimal[] services = lire(donnees, "SERVICES");
        BigDecimal[] subventions = lire(donnees, "SUBVENTIONS");
        BigDecimal[] taxes = lire(donnees, "TAXES");
        BigDecimal[] personnel = lire(donnees, "PERSONNEL");
        BigDecimal[] autresProduits = lire(donnees, "AUTRES_PRODUITS");
        BigDecimal[] autresCharges = lire(donnees, "AUTRES_CHARGES");
        BigDecimal[] amortissements = lire(donnees, "AMORTISSEMENTS");
        BigDecimal[] provisions = lire(donnees, "PROVISIONS");
        BigDecimal[] reprises = lire(donnees, "REPRISES");
        BigDecimal[] produitsFin = lire(donnees, "PRODUITS_FIN");
        BigDecimal[] chargesFin = lire(donnees, "CHARGES_FIN");
        BigDecimal[] impot = lire(donnees, "IMPOT");
        BigDecimal[] impotDifferes = lire(donnees, "IMPOTS_DIFFERES");
        BigDecimal[] extraProduits = lire(donnees, "EXTRA_PRODUITS");
        BigDecimal[] extraCharges = lire(donnees, "EXTRA_CHARGES");

        ajouterLigne(lignes, "CA", "Chiffre d'affaires", ca, "normal");
        ajouterLigne(lignes, "STOCK", "Production stockée", stock, "normal");
        ajouterLigne(lignes, "IMMOB", "Production immobilisée", immob, "normal");

        BigDecimal[] production = additionner(
                additionner(ca, stock),
                immob
        );

        ajouterLigne(
                lignes, "I", "I. PRODUCTION DE L'EXERCICE",
                production, "sous-total"
        );

        ajouterLigne(lignes, "ACHATS", "Achats consommés", achats, "normal");
        ajouterLigne(lignes, "SERVICES", "Services extérieurs", services, "normal");

        BigDecimal[] consommation = additionner(achats, services);

        ajouterLigne(
                lignes, "II", "II. CONSOMMATION DE L'EXERCICE",
                consommation, "sous-total"
        );

        BigDecimal[] valeurAjoutee = soustraire(
                production, consommation
        );

        ajouterLigne(
                lignes, "III", "III. VALEUR AJOUTÉE",
                valeurAjoutee, "sous-total"
        );

        ajouterLigne(
                lignes, "SUBVENTIONS", "Subventions d'exploitation",
                subventions, "normal"
        );
        ajouterLigne(
                lignes, "TAXES", "Impôts et taxes",
                taxes, "normal"
        );
        ajouterLigne(
                lignes, "PERSONNEL", "Charges de personnel",
                personnel, "normal"
        );

        BigDecimal[] ebe = soustraire(
                soustraire(
                        additionner(valeurAjoutee, subventions),
                        taxes
                ),
                personnel
        );

        ajouterLigne(
                lignes, "IV", "IV. EXCÉDENT BRUT D'EXPLOITATION",
                ebe, "sous-total"
        );

        ajouterLigne(
                lignes, "AUTRES_PRODUITS", "Autres produits opérationnels",
                autresProduits, "normal"
        );
        ajouterLigne(
                lignes, "AUTRES_CHARGES", "Autres charges opérationnelles",
                autresCharges, "normal"
        );
        ajouterLigne(
                lignes, "AMORTISSEMENTS", "Dotations aux amortissements",
                amortissements, "normal"
        );
        ajouterLigne(
                lignes, "PROVISIONS", "Dotations aux provisions",
                provisions, "normal"
        );
        ajouterLigne(
                lignes, "REPRISES", "Reprises sur provisions",
                reprises, "normal"
        );

        BigDecimal[] operationnel = additionner(
                soustraire(
                        soustraire(
                                soustraire(
                                        additionner(ebe, autresProduits),
                                        autresCharges
                                ),
                                amortissements
                        ),
                        provisions
                ),
                reprises
        );

        ajouterLigne(
                lignes, "V", "V. RÉSULTAT OPÉRATIONNEL",
                operationnel, "sous-total"
        );

        ajouterLigne(
                lignes, "PRODUITS_FIN", "Produits financiers",
                produitsFin, "normal"
        );
        ajouterLigne(
                lignes, "CHARGES_FIN", "Charges financières",
                chargesFin, "normal"
        );

        BigDecimal[] financier = soustraire(
                produitsFin, chargesFin
        );

        ajouterLigne(
                lignes, "VI", "VI. RÉSULTAT FINANCIER",
                financier, "sous-total"
        );

        BigDecimal[] avantImpots = additionner(
                operationnel, financier
        );

        ajouterLigne(
                lignes, "VII", "VII. RÉSULTAT AVANT IMPÔTS",
                avantImpots, "sous-total"
        );

        ajouterLigne(
                lignes, "IMPOT", "Impôt exigible sur le résultat",
                impot, "normal"
        );
        ajouterLigne(
                lignes, "IMPOTS_DIFFERES", "Impôts différés",
                impotDifferes, "normal"
        );

        BigDecimal[] ordinaire = soustraire(
                soustraire(avantImpots, impot),
                impotDifferes
        );

        ajouterLigne(
                lignes, "VIII", "VIII. RÉSULTAT NET ORDINAIRE",
                ordinaire, "sous-total"
        );

        ajouterLigne(
                lignes, "EXTRA_PRODUITS", "Produits extraordinaires",
                extraProduits, "normal"
        );
        ajouterLigne(
                lignes, "EXTRA_CHARGES", "Charges extraordinaires",
                extraCharges, "normal"
        );

        BigDecimal[] extraordinaire = soustraire(
                extraProduits, extraCharges
        );

        ajouterLigne(
                lignes, "IX", "IX. RÉSULTAT EXTRAORDINAIRE",
                extraordinaire, "sous-total"
        );

        BigDecimal[] net = additionner(
                ordinaire, extraordinaire
        );

        ajouterLigne(
                lignes, "X", "X. RÉSULTAT NET DE L'EXERCICE",
                net, "resultat-final"
        );

        BigDecimal[] marges = new BigDecimal[12];

        for (int i = 0; i < 12; i++) {
            marges[i] = ca[i].signum() == 0
                    ? ZERO
                    : net[i]
                        .multiply(BigDecimal.valueOf(100))
                        .divide(ca[i], 2, RoundingMode.HALF_UP);
        }

        BigDecimal caAnnuel = somme(ca);

        BigDecimal margeAnnuelle = caAnnuel.signum() == 0
                ? ZERO
                : somme(net)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(caAnnuel, 2, RoundingMode.HALF_UP);

        Map<String, Object> marge = new LinkedHashMap<>();

        marge.put("code", "MARGE");
        marge.put("rubrique", "Marge nette");
        marge.put("mensuel", Arrays.asList(marges));
        marge.put("totalAnnuel", margeAnnuelle);
        marge.put("type", "resultat-final");
        marge.put("format", "pourcentage");

        lignes.add(marge);

        return lignes;
    }
}
