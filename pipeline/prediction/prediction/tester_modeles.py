from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score

BASE = Path(__file__).resolve().parent.parent
INPUT = BASE/"output"/"dataset_ml.csv"
OUTPUT = BASE/"output"/"metriques_modeles.csv"

df = pd.read_csv(INPUT)
ANNEE_TEST = int(df["annee"].max())

config = {
    "ventes":["index_temps","mois_sin","mois_cos","ventes_lag_12"],
    "ca_export":["index_temps","mois_sin","mois_cos","ca_export_lag_12"],
    "production_reelle":["index_temps","mois_sin","mois_cos","production_lag_12"],
    "charges_exploitation":["index_temps","mois_sin","mois_cos","charges_lag_12"],
    "frais_export":["index_temps","mois_sin","mois_cos","frais_export_lag_12"],
    "masse_salariale":["index_temps","mois_sin","mois_cos","masse_salariale_lag_12"]
}

print("="*80)
print(f"SXMXDX - BACKTEST {ANNEE_TEST}")
print("="*80)

resultats = []
for cible,features in config.items():
    data = df[["annee","mois",cible]+features].dropna()
    train,test = data[data["annee"]<ANNEE_TEST],data[data["annee"]==ANNEE_TEST]
    if train.empty or test.empty:
        print(f"[IGNORÉ] {cible} : données insuffisantes")
        continue

    modele = LinearRegression().fit(train[features],train[cible])
    reel = test[cible].to_numpy()
    pred = np.maximum(modele.predict(test[features]),0)

    mae = mean_absolute_error(reel,pred)
    rmse = np.sqrt(mean_squared_error(reel,pred))
    r2 = r2_score(reel,pred) if len(reel)>1 else np.nan
    masque = reel!=0
    mape = np.mean(np.abs((reel[masque]-pred[masque])/reel[masque]))*100 if masque.any() else np.nan
    ecart_annuel = ((pred.sum()-reel.sum())/reel.sum()*100) if reel.sum()!=0 else np.nan

    resultats.append({"cible":cible,"mae":mae,"rmse":rmse,"mape_pct":mape,"r2":r2,"ecart_annuel_pct":ecart_annuel})

resultats = pd.DataFrame(resultats)
pd.set_option("display.float_format",lambda x:f"{x:,.4f}")

print("\nSYNTHESE")
print(resultats.to_string(index=False))
resultats.to_csv(OUTPUT,index=False)
print(f"\n[OK] {OUTPUT}")