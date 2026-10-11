"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  modifierJalon,
  terminerJalon
} from "@/services/campagne-service";

export type Jalon = {
  id: number;
  code: string;
  nom: string;
  ordre: number;
  dateLimite: string;
  dateRealisation: string | null;
  statut: string;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function JalonBudgetaire({
  campagneId,
  jalons,
  fermee,
  actualiser
}: {
  campagneId: number;
  jalons: Jalon[];
  fermee: boolean;
  actualiser: () => Promise<void>;
}) {
  const [edition, setEdition] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const action = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");

    try {
      await fn();
      await actualiser();
      setEdition(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Jalons</h3>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {jalons.map(j => {
        const fini = j.statut === "TERMINE";
        const reel = j.dateRealisation?.slice(0, 10);
        const enRetard = !fini && today() > j.dateLimite;
        const termineEnRetard = fini && !!reel && reel > j.dateLimite;

        const statut = termineEnRetard
          ? "Terminé en retard"
          : fini
            ? "Terminé"
            : enRetard
              ? "En retard"
              : today() === j.dateLimite
                ? "À échéance"
                : "En attente";

        return (
          <div key={j.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  {j.ordre}. {j.nom}
                </p>

                <p className={`text-xs ${enRetard
                  ? "text-rose-600"
                  : "text-muted-foreground"}`}>
                  {statut} · Limite : {j.dateLimite}
                  {reel ? ` · Réalisé : ${reel}` : ""}
                </p>
              </div>

              {!fermee && (
                <div className="flex gap-2">
                  {["VERIFICATION", "VALIDATION"].includes(j.code) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setEdition(edition === j.id ? null : j.id);
                        setDate(j.dateLimite);
                      }}
                    >
                      Échéance
                    </Button>
                  )}

                  {j.code === "VERIFICATION" && !fini && (
                    <Button
                      size="sm"
                      disabled={
                        busy ||
                        !jalons
                          .filter(x => ["IMPORTATION", "GENERATION"].includes(x.code))
                          .every(x => x.statut === "TERMINE")
                      }
                      onClick={() => action(
                        () => terminerJalon(campagneId, j.id)
                      )}
                    >
                      Vérification terminée
                    </Button>
                  )}
                </div>
              )}
            </div>

            {edition === j.id && (
              <div className="mt-3 flex gap-2">
                <Input
                  className="max-w-52"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />

                <Button
                  size="sm"
                  disabled={busy || !date}
                  onClick={() => action(
                    () => modifierJalon(campagneId, j.id, date)
                  )}
                >
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}