# Reverse engineering : 12dafad4_SOMIDA_2021.xlsx

## Feuilles

| Feuille | Formules | Mise en page temporelle |
|---|---|---|
| Donnees SOMIDA | 0 | aucune mise en page temporelle détectée |
| Employes | 94 | aucune mise en page temporelle détectée |
| Production | 0 | mois en colonnes D:O (en-tête ligne 1), total en P [DETECTEE] |
| Charges | 3 | mois en colonnes E:P (en-tête ligne 1), total en Q [DETECTEE] |
| Exportations | 128 | mois en colonnes G:R (en-tête ligne 9), total en S [DETECTEE] |
| Frais Export | 0 | mois en colonnes E:P (en-tête ligne 1), total en Q [DETECTEE] |
| Synthese | 78 | mois en colonnes C:N (en-tête ligne 1), total en O [DETECTEE] |
| Amortissements | 11 | mois en colonnes E:P (en-tête ligne 1), total en Q [DETECTEE] |
| CR | 403 | mois en colonnes B:M (en-tête ligne 4), total en N [DETECTEE] |

## Resultat

- Formules Excel : 717
- Regles uniques apres regroupement : 116
- Regles formalisees (avec libelle metier) : 110
- Regles a valider (libelle non identifie) : 6

## Exemples de regles metier detectees

- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`
- **amortissement** (ANNUELLE) = `SUM(general)`

## Points d'attention : formules differentes dans un meme regroupement

- RG_CR_009 (CR) : formule differente en C9, D9, E9, F9, G9, H9, I9, J9, K9, L9, M9
- RG_CR_011 (CR) : formule differente en C10, D10, E10, F10, G10, H10, I10, J10, K10, L10, M10
- RG_CR_019 (CR) : formule differente en C14, D14, E14, F14, G14, H14, I14, J14, K14, L14, M14
- RG_CR_039 (CR) : formule differente en C24, D24, E24, F24, G24, H24, I24, J24, K24, L24, M24
- RG_EXPORTATIONS_003 (Exportations) : formule differente en J5, M5
- RG_SYNTHESE_001 (Synthese) : formule differente en D2, E2, F2, G2, H2, I2, J2, K2, L2, M2, N2
- RG_SYNTHESE_005 (Synthese) : formule differente en D4, E4, F4, G4, H4, I4, J4, K4, L4, M4, N4

## Regles a valider manuellement

- RG_EXPORTATIONS_008 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S18)
- RG_EXPORTATIONS_011 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S24)
- RG_EXPORTATIONS_016 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S33)
- RG_EXPORTATIONS_019 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S39)
- RG_EXPORTATIONS_024 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S48)
- RG_EXPORTATIONS_027 : LIBELLE_METIER_NON_IDENTIFIE (Exportations!S54)
