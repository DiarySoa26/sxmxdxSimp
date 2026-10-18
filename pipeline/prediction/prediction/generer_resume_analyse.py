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
INTERVALLES = OUTPUT_DIR/f"prediction_budget_{ANNEE}_intervalles.csv"
ALERTES = OUTPUT_DIR/"alertes_qualite_donnees.txt"
OUTPUT = OUTPUT_DIR/f"resume_analyse_{ANNEE}.txt"

budget = pd.read_csv(BUDGET_ANNUEL).iloc[0]
mensuel = pd.read_csv(BUDGET_MENSUEL)
derives = pd.read_csv(DERIVES)
intervalles = pd.read_csv(INTERVALLES).set_index("indicateur") if INTERVALLES.exists() else None
alertes = [l.strip() for l in ALERTES.read_text(encoding="utf-8").splitlines() if l.strip()] if ALERTES.exists() else []
alertes = [a for a in alertes if not a.lower().startswith("aucune alerte")]

MOIS = {1:"janvier",2:"février",3:"mars",4:"avril",5:"mai",6:"juin",
        7:"juillet",8:"août",9:"septembre",10:"octobre",11:"novembre",12:"décembre"}

def nom_mois(n): return MOIS.get(int(n),f"mois {int(n)}")

def fr(v,d=2):
    """Nombre au format français : 1 234,56"""
    return f"{float(v):,.{d}f}".replace(",","\u00a0").replace(".",",")

def montant(v):
    """Montant lisible en MGA : '18,54 milliards MGA', '24,7 millions MGA'."""
    v = float(v); signe = "-" if v<0 else ""; a = abs(v)
    if a>=1e9: return f"{signe}{fr(a/1e9,2)} {'milliard' if a<2e9 else 'milliards'} MGA"
    if a>=1e6: return f"{signe}{fr(a/1e6,1)} {'million' if a<2e6 else 'millions'} MGA"
    return f"{signe}{fr(a,0)} MGA"

def pct(v): return f"{fr(abs(float(v)),2)} %"

NOMS_CATEGORIES = {"SECURITE":"sécurité","LOGISTIQUE":"logistique","FINANCE":"finance",
                   "FISCAL":"fiscalité","PRODUCTION":"production"}

def nom_cat(c): return NOMS_CATEGORIES.get(str(c).upper(),str(c).lower())

def evolution(v,pluriel=False):
    """Décrit une variation en mots : 'en légère baisse de 2,53 %'."""
    v = float(v); a = abs(v)
    if a<1: return f"quasi stable{'s' if pluriel else ''} ({'+' if v>0 else '-' if v<0 else ''}{pct(v)})"
    sens = "hausse" if v>0 else "baisse"
    force = "légère " if a<5 else "forte " if a>=15 else ""
    marque = " marquée" if 5<=a<15 else ""
    return f"en {force}{sens}{marque} de {pct(v)}"

def valeur_reference(prevu,evol_pct):
    return float(prevu)/(1+float(evol_pct)/100) if float(evol_pct)>-100 else float("nan")

def fourchette(indicateur,formateur):
    if intervalles is None or indicateur not in intervalles.index: return None
    l = intervalles.loc[indicateur]
    if pd.isna(l["borne_basse_80"]) or pd.isna(l["borne_haute_80"]): return None
    return f"entre {formateur(l['borne_basse_80'])} et {formateur(l['borne_haute_80'])}"

# ---------------------------------------------------------------------------
categories_noms = sorted(derives["categorie"].dropna().unique())
liste_cat = ", ".join(nom_cat(c) for c in categories_noms)

ca_max = mensuel.loc[mensuel["ca_export"].idxmax()]
ca_min = mensuel.loc[mensuel["ca_export"].idxmin()]
ecart_mois_pct = (ca_max["ca_export"]-ca_min["ca_export"])/mensuel["ca_export"].mean()*100

evo_ventes = float(budget["evolution_ventes_pct"])
evo_ca = float(budget["evolution_ca_pct"])
evo_prod = float(budget["evolution_production_pct"])
evo_charges = float(budget["evolution_charges_pct"])
evo_frais = float(budget["evolution_frais_export_pct"])
evo_ms = float(budget["evolution_masse_salariale_pct"])
marge = float(budget["marge_operationnelle"])*100
resultat = float(budget["resultat_operationnel"])

NIVEAUX = ["FAIBLE","MODERE","ELEVE","CRITIQUE"]
distribution = derives["niveau_risque"].value_counts()
nb = {n:int(distribution.get(n,0)) for n in NIVEAUX}
total_controles = len(derives)
pire_niveau = max((n for n in NIVEAUX if nb[n]>0),key=NIVEAUX.index,default="FAIBLE")

LIBELLE_NIVEAU = {
    "FAIBLE":"rien d'inquiétant",
    "MODERE":"à surveiller",
    "ELEVE":"à examiner en priorité",
    "CRITIQUE":"écart important, à vérifier sans attendre",
}

lignes = [f"BUDGET PRÉVISIONNEL {ANNEE} — RÉSUMÉ",
        #   f"(Tous les montants sont en Ariary malgache, noté MGA. Les comparaisons se font avec {ANNEE_REFERENCE}.)","",
        #   "EN BREF",""
          ]

# --- En bref -----------------------------------------------------------------
lignes.append(
    f"Pour {ANNEE}, on s'attend à vendre environ {fr(budget['ventes'],0)} unités à l'étranger, soit un chiffre d'affaires "
    f"d'environ {montant(budget['ca_export'])}. Par rapport à {ANNEE_REFERENCE}, les ventes sont {evolution(evo_ventes,True)} "
    f"et le chiffre d'affaires est {evolution(evo_ca)}.")
lignes.append("")
lignes.append(
    f"Après paiement de toutes les dépenses courantes, il resterait environ {montant(resultat)} de bénéfice d'exploitation "
    f"(le « résultat opérationnel »). Autrement dit, sur 100 MGA encaissés, il en resterait environ {fr(marge,0)}.")
lignes.append("")
if pire_niveau in ("ELEVE","CRITIQUE"):
    lignes.append("Point d'attention : certaines dépenses prévues s'écartent nettement de ce que l'activité justifie (voir la partie 5).")
else:
    lignes.append("Côté dépenses, aucun poste ne s'écarte de façon anormale de ce que l'activité prévue justifie.")
lignes.append("")

# --- 1. Prévisions -----------------------------------------------------------
lignes += [f"1. CE QUE L'ON PRÉVOIT POUR {ANNEE}","",
    f"- Ventes : {fr(budget['ventes'],0)} unités (contre environ {fr(valeur_reference(budget['ventes'],evo_ventes),0)} en {ANNEE_REFERENCE}).",
    f"- Chiffre d'affaires à l'exportation : {montant(budget['ca_export'])}.",
    f"- Production : {fr(budget['production'],0)} unités fabriquées.",
    # f"- Charges d'exploitation (coûts du fonctionnement courant : {liste_cat}) : {montant(budget['charges_exploitation'])}.",
    f"- Charges d'exploitation (coûts du fonctionnement courant : {montant(budget['charges_exploitation'])}.",
   
    f"- Frais d'exportation : {montant(budget['frais_export'])}.",
    f"- Masse salariale (salaires et coûts du personnel) : {montant(budget['masse_salariale'])}.",
    f"- Résultat opérationnel : {montant(resultat)}.",""]

# --- 2. Comparaison ----------------------------------------------------------
lignes += [f"2. COMPARAISON AVEC {ANNEE_REFERENCE}","",
    f"- Ventes : {evolution(evo_ventes,True)}.",
    f"- Chiffre d'affaires : {evolution(evo_ca)}.",
    f"- Production : {evolution(evo_prod)}.",
    f"- Charges d'exploitation : {evolution(evo_charges,True)}.",
    f"- Frais d'exportation : {evolution(evo_frais,True)}.",
    f"- Masse salariale : {evolution(evo_ms)}.",""]

# --- 3. Mois par mois --------------------------------------------------------
lignes += ["3. MOIS PAR MOIS","",
    f"Le meilleur mois pour le chiffre d'affaires devrait être {nom_mois(ca_max['mois'])} ({montant(ca_max['ca_export'])}) "
    f"et le plus faible {nom_mois(ca_min['mois'])} ({montant(ca_min['ca_export'])}).",
    ("L'écart entre ces deux mois est faible : l'activité est prévue assez régulière tout au long de l'année."
     if ecart_mois_pct<10 else
     "L'écart entre ces deux mois est notable : l'activité varie sensiblement selon la période de l'année."),""]

# --- 4. Fiabilité ------------------------------------------------------------
lignes += ["4. QUEL DEGRÉ DE CONFIANCE ?","",
    "Pour mesurer la fiabilité de la precision, on a « rejoué » le calcul "
    "sur les années passées et comparé avec ce qui s'est réellement produit."]
f_ca = fourchette("ca_export",montant)
f_res = fourchette("resultat_operationnel",montant)
if f_ca:
    lignes.append(f"- Chiffre d'affaires : la valeur réelle devrait se situer {f_ca} .")
if f_res:
    lignes.append(f"- Résultat opérationnel : il devrait se situer {f_res}.")
if intervalles is not None and "masse_salariale" in intervalles.index and intervalles.loc["masse_salariale","modele"]=="DERNIERE_ANNEE":
    lignes.append("- Masse salariale : on suppose que les salaires restent au niveau actuel. Toute embauche ou augmentation décidée "
                  "pour l'année devra s'ajouter à ce chiffre.")
# if alertes:
#     lignes.append("- Attention, anomalie dans les données de départ : " + " ; ".join(alertes) +
#                   ". Cela peut fausser les prévisions et doit être vérifié.")
lignes.append("")

# --- 5. Surveillance des dépenses -------------------------------------------
dm = derives.loc[derives["indice_derive"].idxmax()]
nb_mois = total_controles//max(len(categories_noms),1)
detail = f"{nb['FAIBLE']} sans souci"
if nb["MODERE"]: detail += f", {nb['MODERE']} à surveiller"
if nb["ELEVE"]: detail += f", {nb['ELEVE']} à examiner en priorité"
if nb["CRITIQUE"]: detail += f", {nb['CRITIQUE']} critique(s)"
lignes += ["5. SURVEILLANCE DES DÉPENSES","",
    "On vérifie ici si chaque poste de dépenses prévu est cohérent avec le niveau de production attendu. "
    "Un poste « dérive » quand il est prévu plus cher (ou moins cher) que ce que l'activité justifie habituellement.",
    # f"Sur {total_controles} contrôles ({len(categories_noms)} postes × {nb_mois} mois) : {detail}.","",
    f"Le plus gros écart concerne le poste « {nom_cat(dm['categorie'])} » en {nom_mois(dm['mois'])} : "
    f"{montant(dm['charge_prevue'])} prévus contre {montant(dm['charge_attendue'])} attendus, "
    f"soit {montant(abs(dm['ecart_mga']))} de {'plus' if dm['ecart_mga']>0 else 'moins'} ({pct(dm['ecart_pct'])}). "
    f"Niveau : {LIBELLE_NIVEAU[dm['niveau_risque']]}.","",
    "Poste par poste :"]

par_cat = derives.groupby("categorie").agg(ecart=("ecart_mga","sum"),
        pire=("niveau_risque",lambda s: max(s,key=NIVEAUX.index))).reset_index()
par_cat["rang"] = par_cat["pire"].map(NIVEAUX.index)
for _,c in par_cat.sort_values(["rang","ecart"],ascending=[False,False]).iterrows():
    sens = "au-dessus" if c["ecart"]>0 else "en dessous"
    lignes.append(f"- {nom_cat(c['categorie']).capitalize()} : {LIBELLE_NIVEAU[c['pire']]} "
                  f"(sur l'année, {montant(abs(c['ecart']))} {sens} de ce que l'activité justifie).")
lignes.append("")

# --- 6. Conclusion -----------------------------------------------------------
lignes += ["6. CONCLUSION",""]
if abs(evo_ca)<5 and abs(evo_ventes)<5:
    lignes.append(f"L'année {ANNEE} s'annonce globalement stable par rapport à {ANNEE_REFERENCE} : ventes {evolution(evo_ventes,True)}, "
                  f"chiffre d'affaires {evolution(evo_ca)}.")
else:
    lignes.append(f"L'année {ANNEE} montre une évolution sensible : ventes {evolution(evo_ventes,True)}, chiffre d'affaires {evolution(evo_ca)}.")
if evo_charges>evo_prod+1:
    lignes.append(f"Point de vigilance : les charges d'exploitation augmentent plus vite que la production "
                  f"({evolution(evo_charges,True)} contre {evolution(evo_prod)}), ce qui pèse sur la rentabilité.")
else:
    lignes.append("Les dépenses d'exploitation évoluent au même rythme que la production ou moins vite : pas de dérive de coûts d'ensemble.")
if nb["CRITIQUE"]: lignes.append(f"{nb['CRITIQUE']} contrôle(s) de dépenses sont critiques et méritent une vérification rapide.")
elif nb["ELEVE"]: lignes.append(f"{nb['ELEVE']} contrôle(s) de dépenses sont à examiner en priorité.")
else: lignes.append("Aucun écart de dépenses n'est préoccupant.")

lignes += ["","POUR MIEUX COMPRENDRE","",
    "- MGA : Ariary malgache, la monnaie utilisée pour tous les montants.",
    "- Chiffre d'affaires (CA) : total des ventes encaissées.",
    "- Charges d'exploitation : dépenses du fonctionnement courant de l'activité.",
    "- Frais d'exportation : coûts liés à l'envoi des produits à l'étranger.",
    "- Masse salariale : total des salaires et coûts du personnel.",
    "- Résultat opérationnel : ce qui reste du chiffre d'affaires après ces dépenses ; la marge en est la part, par exemple 30 % = 30 MGA conservés pour 100 MGA encaissés.",
    "- Dérive : écart entre une dépense prévue et celle que l'on attendrait vu le niveau de production. C'est un indicateur statistique d'alerte, pas une preuve d'anomalie."]

resume = "\n".join(lignes)
print(resume)

with open(OUTPUT,"w",encoding="utf-8") as f:
    f.write(resume)

print(f"\n[OK] Résumé créé : {OUTPUT}")
