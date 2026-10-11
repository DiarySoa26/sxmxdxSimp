"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import {
  listerCampagnes,
  detailsCampagne,
  validerCampagne
} from "@/services/campagne-service";

import JalonBudgetaire, {
  type Jalon
} from "./JalonBudgetaire";

type Campagne = {
  id: number;
  nom: string;
  statut: string;
};

type Details = {
  campagne: Campagne;
  jalons: Jalon[];
  progression: number;
  jalonsTermines: number;
  totalJalons: number;
  jalonsEnRetard: number;
};

export default function CampagneBudgetaire({
  nouvelleId
}: {
  nouvelleId: number | null;
}) {
  const [liste, setListe] = useState<Campagne[]>([]);
  const [id, setId] = useState<number | null>(nouvelleId);
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const actualiser = useCallback(async () => {
    const campagnes = await listerCampagnes();
    setListe(campagnes);

    if (id) {
      setDetails(await detailsCampagne(id));
    } else {
      setDetails(null);
    }
  }, [id]);

  useEffect(() => {
    if (nouvelleId) {
      setId(nouvelleId);
    }
  }, [nouvelleId]);

  useEffect(() => {
    actualiser().catch(e => setError(e.message));
  }, [actualiser]);

  const fermee = details &&
    ["TERMINEE", "ANNULEE"].includes(details.campagne.statut);

  const pret = details?.jalons
    .filter(j => j.code !== "VALIDATION")
    .every(j => j.statut === "TERMINE") ?? false;

  const valider = async () => {
    if (!id || !window.confirm(
      "Valider le budget et terminer la campagne ?"
    )) return;

    setBusy(true);
    setError("");

    try {
      await validerCampagne(id);
      await actualiser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi des campagnes budgétaires</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <label className="block space-y-1 text-sm">
          Campagne

          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={id ?? ""}
            onChange={e => setId(
              e.target.value ? Number(e.target.value) : null
            )}
          >
            <option value="">Sélectionner</option>

            {liste.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom} — {c.statut}
              </option>
            ))}
          </select>
        </label>

        {details && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Progression", `${details.progression}%`],
                ["Terminés", `${details.jalonsTermines}/${details.totalJalons}`],
                ["En retard", String(details.jalonsEnRetard)]
              ].map(([titre, valeur]) => (
                <div key={titre} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    {titre}
                  </p>
                  <p className="text-xl font-semibold">
                    {valeur}
                  </p>
                </div>
              ))}
            </div>

            <JalonBudgetaire
              campagneId={details.campagne.id}
              jalons={details.jalons}
              fermee={!!fermee}
              actualiser={actualiser}
            />

            {!fermee && (
              <div className="flex justify-end">
                <Button disabled={!pret || busy} onClick={valider}>
                  Valider le budget
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}