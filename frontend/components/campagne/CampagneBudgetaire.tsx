"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

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

// ===========================
// TYPES
// ===========================

type Campagne = {
  id: number;
  exerciceId: number;
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

  const [id, setId] = useState<number | null>(
    nouvelleId
  );

  const [details, setDetails] =
    useState<Details | null>(null);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const [actualisation, setActualisation] =
    useState(false);

  const [chargementInitial, setChargementInitial] =
    useState(true);


  const actualiser = useCallback(async () => {

    setActualisation(true);

    try {

      const campagnes = await listerCampagnes();

      setListe(campagnes);

      if (id !== null) {

        const nouvellesDonnees =
          await detailsCampagne(id);

        // Actualisation des statistiques et jalons
        setDetails(nouvellesDonnees);

      } else {

        setDetails(null);

      }

      setError("");

    } catch (e) {

      console.error(
        "Erreur actualisation campagne :",
        e
      );

      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'actualiser la campagne."
      );

      throw e;

    } finally {

      setActualisation(false);
      setChargementInitial(false);

    }

  }, [id]);


  useEffect(() => {

    if (nouvelleId !== null) {
      setId(nouvelleId);
    }

  }, [nouvelleId]);


  useEffect(() => {

    actualiser().catch(console.error);

  }, [actualiser]);

  const fermee = details
    ? ["TERMINEE", "ANNULEE"].includes(
        details.campagne.statut?.toUpperCase()
      )
    : false;

  const prerequisValidation = [
    "IMPORTATION",
    "GENERATION",
    "VERIFICATION"
  ];

  const pret = details
    ? prerequisValidation.every(code =>
        details.jalons.some(j =>
          j.code?.toUpperCase() === code &&
          j.statut?.toUpperCase() === "TERMINE"
        )
      )
    : false;

  const valider = async () => {

    if (!id || busy || actualisation || !pret) {
      return;
    }

    const confirmation = window.confirm(
      "Valider le budget et terminer la campagne ?"
    );

    if (!confirmation) return;

    setBusy(true);
    setError("");

    try {

      // Validation côté Spring Boot
      await validerCampagne(id);

      // Recharger immédiatement les données
      await actualiser();

    } catch (e) {

      console.error(
        "Erreur validation campagne :",
        e
      );

      setError(
        e instanceof Error
          ? e.message
          : "Impossible de valider le budget."
      );

    } finally {

      setBusy(false);

    }
  };
  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Suivi des campagnes budgétaires
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ERREUR */}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* SÉLECTION CAMPAGNE */}

        <label className="block space-y-1 text-sm">

          <span>Campagne</span>

          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={id ?? ""}
            disabled={busy}
            onChange={e => {

              const nouvelleValeur =
                e.target.value
                  ? Number(e.target.value)
                  : null;

              setId(nouvelleValeur);
              setDetails(null);
              setError("");

            }}
          >

            <option value="">
              Sélectionner
            </option>

            {liste.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom} — {c.statut}
              </option>
            ))}

          </select>

        </label>

        {/* CHARGEMENT INITIAL */}

        {chargementInitial && (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des campagnes...
          </div>
        )}

        {/* DÉTAILS */}

        {details && (

          <>

            {/* STATISTIQUES */}

            <div className="space-y-3">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-medium">
                  Statistiques de la campagne
                </h3>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy || actualisation}
                  onClick={() =>
                    actualiser().catch(console.error)
                  }
                >

                  {actualisation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}

                  Actualiser

                </Button>

              </div>

              <div className="grid grid-cols-3 gap-2">

                <div className="rounded-lg border p-3">

                  <p className="text-xs text-muted-foreground">
                    Progression
                  </p>

                  <p className="text-xl font-semibold">
                    {details.progression}%
                  </p>

                </div>

                <div className="rounded-lg border p-3">

                  <p className="text-xs text-muted-foreground">
                    Terminés
                  </p>

                  <p className="text-xl font-semibold">
                    {details.jalonsTermines}/
                    {details.totalJalons}
                  </p>

                </div>

                <div className="rounded-lg border p-3">

                  <p className="text-xs text-muted-foreground">
                    En retard
                  </p>

                  <p className="text-xl font-semibold">
                    {details.jalonsEnRetard}
                  </p>

                </div>

              </div>

            </div>

            {/* JALONS */}

            <JalonBudgetaire
              campagneId={details.campagne.id}
              exerciceId={details.campagne.exerciceId}
              jalons={details.jalons}
              busy={busy}
              onJalonTermine={actualiser}
            />

            {/* VALIDATION FINALE */}

            {!fermee && (

              <div className="space-y-3">

                {pret && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">

                    <CheckCircle2 className="h-4 w-4" />

                    Tous les jalons préalables sont terminés.
                    Le budget peut être validé.

                  </div>
                )}

                <div className="flex justify-end">

                  <Button
                    type="button"
                    disabled={
                      !pret ||
                      busy ||
                      actualisation
                    }
                    onClick={valider}
                  >

                    {busy || actualisation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {busy
                          ? "Validation..."
                          : "Actualisation..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Valider le budget
                      </>
                    )}

                  </Button>

                </div>

              </div>

            )}

            {/* CAMPAGNE TERMINÉE */}

            {details.campagne.statut?.toUpperCase() ===
              "TERMINEE" && (

              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">

                <CheckCircle2 className="h-5 w-5" />

                Campagne budgétaire terminée et validée.

              </div>

            )}

          </>

        )}

      </CardContent>

    </Card>
  );
}
