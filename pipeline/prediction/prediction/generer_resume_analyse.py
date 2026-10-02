# from pathlib import Path
# import pandas as pd

# BASE = Path(__file__).resolve().parent.parent
# OUTPUT_DIR = BASE / "output"
# DATASET = pd.read_csv(OUTPUT_DIR / "dataset_ml.csv")
# ANNEE_REFERENCE = int(DATASET["annee"].max())
# ANNEE = ANNEE_REFERENCE + 1

# BUDGET_ANNUEL = OUTPUT_DIR / f"prediction_budget_{ANNEE}_annuel.csv"
# BUDGET_MENSUEL = OUTPUT_DIR / f"prediction_budget_{ANNEE}_mensuel.csv"
# DERIVES = OUTPUT_DIR / f"derives_categories_{ANNEE}.csv"
# OUTPUT = OUTPUT_DIR / f"resume_analyse_{ANNEE}.txt"

# budget = pd.read_csv(BUDGET_ANNUEL).iloc[0]
# mensuel = pd.read_csv(BUDGET_MENSUEL)
# derives = pd.read_csv(DERIVES)

# def mga(v):
#     return f"{float(v):,.0f}".replace(",", " ") + " MGA"

# def nombre(v):
#     return f"{float(v):,.2f}".replace(",", " ")

# def pct(v):
#     v = float(v)
#     return f"{'+' if v > 0 else ''}{v:.2f} %"

# distribution = derives["niveau_risque"].value_counts()
# faible = int(distribution.get("FAIBLE", 0))
# modere = int(distribution.get("MODERE", 0))
# eleve = int(distribution.get("ELEVE", 0))
# critique = int(distribution.get("CRITIQUE", 0))

# derive_max = derives.loc[derives["indice_derive"].idxmax()]
# ca_max = mensuel.loc[mensuel["ca_export"].idxmax()]
# ca_min = mensuel.loc[mensuel["ca_export"].idxmin()]

# categories = derives.groupby("categorie").agg(
#     indice_moyen=("indice_derive", "mean"),
#     indice_max=("indice_derive", "max"),
#     ecart_total=("ecart_mga", "sum")
# ).reset_index().sort_values("indice_max", ascending=False)

# lignes = [
#     f"ANALYSE BUDGETAIRE PREVISIONNELLE {ANNEE}",
#     "=" * 70, "",
#     "1. Synthèse budgétaire", "",
#     f"Les ventes prévisionnelles pour {ANNEE} sont estimées à {nombre(budget['ventes'])} unités, soit une évolution de {pct(budget['evolution_ventes_pct'])} par rapport à {ANNEE_REFERENCE}.",
#     "",
#     f"Ces ventes devraient générer un chiffre d'affaires prévisionnel de {mga(budget['ca_export'])}, soit une évolution de {pct(budget['evolution_ca_pct'])}.",
#     "",
#     f"La production annuelle est estimée à {nombre(budget['production'])} unités. Les charges d'exploitation atteignent {mga(budget['charges_exploitation'])}, les frais d'exportation {mga(budget['frais_export'])} et la masse salariale {mga(budget['masse_salariale'])}.",
#     "",
#     f"Le résultat opérationnel prévisionnel atteint {mga(budget['resultat_operationnel'])}, pour une marge opérationnelle de {float(budget['marge_operationnelle']) * 100:.2f} %.",
#     "",
#     f"2. Evolution par rapport à {ANNEE_REFERENCE}", "",
#     f"Ventes : {pct(budget['evolution_ventes_pct'])}.",
#     f"Chiffre d'affaires / revenus : {pct(budget['evolution_ca_pct'])}.",
#     f"Production : {pct(budget['evolution_production_pct'])}.",
#     f"Charges d'exploitation : {pct(budget['evolution_charges_pct'])}.",
#     f"Frais d'exportation : {pct(budget['evolution_frais_export_pct'])}.",
#     f"Masse salariale : {pct(budget['evolution_masse_salariale_pct'])}.",
#     "",
#     "3. Trajectoire mensuelle", "",
#     f"Le chiffre d'affaires mensuel maximal est prévu au mois {int(ca_max['mois'])}, avec {mga(ca_max['ca_export'])}.",
#     f"Le chiffre d'affaires mensuel minimal est prévu au mois {int(ca_min['mois'])}, avec {mga(ca_min['ca_export'])}.",
#     "",
#     "4. Analyse des dérives de dépenses", "",
#     f"L'analyse identifie {faible} observations à niveau faible, {modere} à niveau modéré, {eleve} à niveau élevé et {critique} à niveau critique.",
#     "",
#     f"L'écart statistique maximal concerne {derive_max['categorie']} au mois {int(derive_max['mois'])}. La charge prévue est de {mga(derive_max['charge_prevue'])}, contre {mga(derive_max['charge_attendue'])} attendus selon le comportement historique associé à la production.",
#     f"L'écart atteint {mga(derive_max['ecart_mga'])}, soit {float(derive_max['ecart_pct']):.2f} %. L'indice de dérive est de {float(derive_max['indice_derive']):.2f}/100, avec un niveau {derive_max['niveau_risque']}.",
#     "",
#     "5. Analyse par catégorie", ""
# ]

# for _, cat in categories.iterrows():
#     lignes.append(
#         f"- {cat['categorie']} : indice moyen {cat['indice_moyen']:.2f}/100, "
#         f"indice maximal {cat['indice_max']:.2f}/100, écart cumulé {mga(cat['ecart_total'])}."
#     )

# lignes.extend(["", "6. Conclusion automatique", ""])

# if float(budget["evolution_charges_pct"]) > float(budget["evolution_production_pct"]):
#     lignes.append(
#         f"Les charges d'exploitation progressent plus rapidement que la production "
#         f"({budget['evolution_charges_pct']:.2f} % contre {budget['evolution_production_pct']:.2f} %). "
#         f"Les postes présentant les indices de dérive les plus élevés sont signalés pour analyse."
#     )
# else:
#     lignes.append(
#         f"La progression des charges d'exploitation ({budget['evolution_charges_pct']:.2f} %) "
#         f"ne dépasse pas celle de la production ({budget['evolution_production_pct']:.2f} %)."
#     )

# if critique:
#     lignes.append(f"{critique} observation(s) présentent un niveau critique.")
# elif eleve:
#     lignes.append(f"Aucune observation critique n'est détectée ; {eleve} observation(s) présentent toutefois un niveau élevé.")
# else:
#     lignes.append("Aucune observation élevée ou critique n'est détectée.")

# lignes.extend([
#     "", "Note méthodologique", "",
#     "L'indice de dérive est un indicateur statistique construit à partir de l'écart entre les charges prévisionnelles et leur comportement historique par rapport à la production. Il ne constitue pas une probabilité calibrée d'anomalie."
# ])

# resume = "\n".join(lignes)
# print(resume)

# with open(OUTPUT, "w", encoding="utf-8") as f:
#     f.write(resume)

# print(f"\n[OK] Résumé créé : {OUTPUT}")




from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE/"output"
DATASET = pd.read_csv(OUTPUT_DIR/"dataset_ml.csv")
ANNEE_REFERENCE = int(DATASET["annee"].max())
ANNEE = ANNEE_REFERENCE+1

BUDGET_ANNUEL = OUTPUT_DIR/f"prediction_budget_{ANNEE}_annuel.csv"
BUDGET_MENSUEL = OUTPUT_DIR/f"prediction_budget_{ANNEE}_mensuel.csv"
DERIVES = OUTPUT_DIR/f"derives_categories_{ANNEE}.csv"
OUTPUT = OUTPUT_DIR/f"resume_analyse_{ANNEE}.txt"

budget = pd.read_csv(BUDGET_ANNUEL).iloc[0]
mensuel = pd.read_csv(BUDGET_MENSUEL)
derives = pd.read_csv(DERIVES)

MOIS = {
    1:"Janvier",2:"Février",3:"Mars",4:"Avril",5:"Mai",6:"Juin",
    7:"Juillet",8:"Août",9:"Septembre",10:"Octobre",11:"Novembre",12:"Décembre"
}

def nom_mois(numero):
    return MOIS.get(int(numero),f"Mois {int(numero)}")

def mga(v):
    return f"{float(v):,.0f}".replace(","," ")+" MGA"

def nombre(v):
    return f"{float(v):,.2f}".replace(","," ")

def variation(v):
    v=float(v)
    if v>0: return f"une évolution de {abs(v):.2f} %"
    if v<0: return f"une régression de {abs(v):.2f} %"
    return "une variation nulle de 0.00 %"

def variation_courte(v):
    v=float(v)
    if v>0: return f"ÉVOLUTION de {abs(v):.2f} %"
    if v<0: return f"RÉGRESSION de {abs(v):.2f} %"
    return "STABLE : 0.00 %"

distribution = derives["niveau_risque"].value_counts()
faible   = int(distribution.get("FAIBLE",0))
modere   = int(distribution.get("MODERE",0))
eleve    = int(distribution.get("ELEVE",0))
critique = int(distribution.get("CRITIQUE",0))

derive_max = derives.loc[derives["indice_derive"].idxmax()]
ca_max = mensuel.loc[mensuel["ca_export"].idxmax()]
ca_min = mensuel.loc[mensuel["ca_export"].idxmin()]

categories = derives.groupby("categorie").agg(
    indice_moyen=("indice_derive","mean"),
    indice_max=("indice_derive","max"),
    ecart_total=("ecart_mga","sum")
).reset_index().sort_values("indice_max",ascending=False)

lignes = [
    f"ANALYSE BUDGETAIRE PREVISIONNELLE {ANNEE}",
    "="*70,"",
    "1. Synthèse budgétaire","",
    f"Les ventes prévisionnelles pour {ANNEE} sont estimées à {nombre(budget['ventes'])} unités, soit {variation(budget['evolution_ventes_pct'])} par rapport à {ANNEE_REFERENCE}.","",
    f"Le chiffre d'affaires à l'exportation prévisionnel est estimé à {mga(budget['ca_export'])}, soit {variation(budget['evolution_ca_pct'])} par rapport à {ANNEE_REFERENCE}.","",
    f"La production annuelle est estimée à {nombre(budget['production'])} unités. Les charges d'exploitation atteignent {mga(budget['charges_exploitation'])}, les frais d'exportation {mga(budget['frais_export'])} et la masse salariale {mga(budget['masse_salariale'])}.","",
    f"Le résultat opérationnel prévisionnel atteint {mga(budget['resultat_operationnel'])}, pour une marge opérationnelle de {float(budget['marge_operationnelle'])*100:.2f} %.","",

    f"2. Evolution par rapport à {ANNEE_REFERENCE}","",
    f"Ventes                  : {variation_courte(budget['evolution_ventes_pct'])}.",
    f"CA export               : {variation_courte(budget['evolution_ca_pct'])}.",
    f"Production              : {variation_courte(budget['evolution_production_pct'])}.",
    f"Charges d'exploitation  : {variation_courte(budget['evolution_charges_pct'])}.",
    f"Frais d'exportation     : {variation_courte(budget['evolution_frais_export_pct'])}.",
    f"Masse salariale         : {variation_courte(budget['evolution_masse_salariale_pct'])}.","",

    "3. Trajectoire mensuelle","",
    f"Le chiffre d'affaires à l'exportation mensuel maximal est prévu en {nom_mois(ca_max['mois'])}, avec {mga(ca_max['ca_export'])}.",
    f"Le chiffre d'affaires à l'exportation mensuel minimal est prévu en {nom_mois(ca_min['mois'])}, avec {mga(ca_min['ca_export'])}.","",

    "4. Analyse des dérives de dépenses","",
    f"L'analyse identifie {faible} observation(s) à niveau faible, {modere} à niveau modéré, {eleve} à niveau élevé et {critique} à niveau critique.","",
    f"L'écart statistique maximal concerne la catégorie {derive_max['categorie']} en {nom_mois(derive_max['mois'])}. "
    f"La charge prévue est de {mga(derive_max['charge_prevue'])}, contre {mga(derive_max['charge_attendue'])} attendus selon le comportement historique associé à la production.",
    f"L'écart atteint {mga(derive_max['ecart_mga'])}, soit {float(derive_max['ecart_pct']):.2f} %. "
    f"L'indice de dérive est de {float(derive_max['indice_derive']):.2f}/100, avec un niveau {derive_max['niveau_risque']}.","",

    "5. Analyse par catégorie",""
]

for _,cat in categories.iterrows():
    lignes.append(
        f"- {cat['categorie']} : indice moyen {cat['indice_moyen']:.2f}/100, "
        f"indice maximal {cat['indice_max']:.2f}/100, "
        f"écart cumulé {mga(cat['ecart_total'])}."
    )

lignes.extend(["","6. Conclusion automatique",""])

evolution_charges = float(budget["evolution_charges_pct"])
evolution_production = float(budget["evolution_production_pct"])
evolution_ca = float(budget["evolution_ca_pct"])
evolution_ventes = float(budget["evolution_ventes_pct"])

lignes.append(
    f"Les quantités vendues à l'exportation enregistrent {variation(evolution_ventes)}, tandis que le chiffre d'affaires "
    f"à l'exportation enregistre {variation(evolution_ca)}."
)

if evolution_charges>evolution_production:
    lignes.append(
        f"Les charges d'exploitation progressent davantage que la production : "
        f"{variation_courte(evolution_charges)} pour les charges contre "
        f"{variation_courte(evolution_production)} pour la production. "
        f"Les catégories présentant les indices de dérive les plus élevés sont signalées pour analyse."
    )
else:
    lignes.append(
        f"L'évolution des charges d'exploitation ({variation_courte(evolution_charges)}) "
        f"ne dépasse pas celle de la production ({variation_courte(evolution_production)})."
    )

if critique:
    lignes.append(f"{critique} observation(s) présentent un niveau de dérive critique.")
elif eleve:
    lignes.append(f"Aucune observation critique n'est détectée ; {eleve} observation(s) présentent toutefois un niveau élevé.")
else:
    lignes.append("Aucune observation présentant un niveau élevé ou critique n'est détectée.")

lignes.extend([
    "","Note méthodologique","",
    "L'indice de dérive est un indicateur statistique construit à partir de l'écart entre les charges prévisionnelles "
    "et leur comportement historique par rapport à la production. Il ne constitue pas une probabilité calibrée d'anomalie."
])

resume="\n".join(lignes)
print(resume)

with open(OUTPUT,"w",encoding="utf-8") as f:
    f.write(resume)

print(f"\n[OK] Résumé créé : {OUTPUT}")