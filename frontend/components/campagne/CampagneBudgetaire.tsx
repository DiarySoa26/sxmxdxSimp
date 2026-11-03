// "use client";

// import { useCallback, useEffect, useState } from "react";

// import {
//   Loader2,
//   CheckCircle2,
//   ShieldCheck,
//   RefreshCw
// } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card";

// import {
//   listerCampagnes,
//   detailsCampagne,
//   validerCampagne
// } from "@/services/campagne-service";

// import JalonBudgetaire, {
//   type Jalon
// } from "./JalonBudgetaire";

// // ===========================
// // TYPES
// // ===========================

// type Campagne = {
//   id: number;
//   exerciceId: number;
//   nom: string;
//   statut: string;
// };

// type Details = {
//   campagne: Campagne;
//   jalons: Jalon[];
//   progression: number;
//   jalonsTermines: number;
//   totalJalons: number;
//   jalonsEnRetard: number;
// };

// export default function CampagneBudgetaire({
//   nouvelleId
// }: {
//   nouvelleId: number | null;
// }) {

//   const [liste, setListe] = useState<Campagne[]>([]);

//   const [id, setId] = useState<number | null>(
//     nouvelleId
//   );

//   const [details, setDetails] =
//     useState<Details | null>(null);

//   const [error, setError] = useState("");

//   const [busy, setBusy] = useState(false);

//   const [actualisation, setActualisation] =
//     useState(false);

//   const [chargementInitial, setChargementInitial] =
//     useState(true);


//   const actualiser = useCallback(async () => {

//     setActualisation(true);

//     try {

//       const campagnes = await listerCampagnes();

//       setListe(campagnes);

//       if (id !== null) {

//         const nouvellesDonnees =
//           await detailsCampagne(id);

//         // Actualisation des statistiques et jalons
//         setDetails(nouvellesDonnees);

//       } else {

//         setDetails(null);

//       }

//       setError("");

//     } catch (e) {

//       console.error(
//         "Erreur actualisation campagne :",
//         e
//       );

//       setError(
//         e instanceof Error
//           ? e.message
//           : "Impossible d'actualiser la campagne."
//       );

//       throw e;

//     } finally {

//       setActualisation(false);
//       setChargementInitial(false);

//     }

//   }, [id]);


//   useEffect(() => {

//     if (nouvelleId !== null) {
//       setId(nouvelleId);
//     }

//   }, [nouvelleId]);


//   useEffect(() => {

//     actualiser().catch(console.error);

//   }, [actualiser]);

//   const fermee = details
//     ? ["TERMINEE", "ANNULEE"].includes(
//         details.campagne.statut?.toUpperCase()
//       )
//     : false;

//   const prerequisValidation = [
//     "IMPORTATION",
//     "GENERATION",
//     "VERIFICATION"
//   ];

//   const pret = details
//     ? prerequisValidation.every(code =>
//         details.jalons.some(j =>
//           j.code?.toUpperCase() === code &&
//           j.statut?.toUpperCase() === "TERMINE"
//         )
//       )
//     : false;

//   const valider = async () => {

//     if (!id || busy || actualisation || !pret) {
//       return;
//     }

//     const confirmation = window.confirm(
//       "Valider le budget et terminer la campagne ?"
//     );

//     if (!confirmation) return;

//     setBusy(true);
//     setError("");

//     try {

//       // Validation côté Spring Boot
//       await validerCampagne(id);

//       // Recharger immédiatement les données
//       await actualiser();

//     } catch (e) {

//       console.error(
//         "Erreur validation campagne :",
//         e
//       );

//       setError(
//         e instanceof Error
//           ? e.message
//           : "Impossible de valider le budget."
//       );

//     } finally {

//       setBusy(false);

//     }
//   };
//   return (
//     <Card>

//       <CardHeader>
//         <CardTitle>
//           Suivi des campagnes budgétaires
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">

//         {/* ERREUR */}

//         {error && (
//           <div
//             role="alert"
//             className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
//           >
//             {error}
//           </div>
//         )}

//         {/* SÉLECTION CAMPAGNE */}

//         <label className="block space-y-1 text-sm">

//           <span>Campagne</span>

//           <select
//             className="h-10 w-full rounded-md border bg-background px-3"
//             value={id ?? ""}
//             disabled={busy}
//             onChange={e => {

//               const nouvelleValeur =
//                 e.target.value
//                   ? Number(e.target.value)
//                   : null;

//               setId(nouvelleValeur);
//               setDetails(null);
//               setError("");

//             }}
//           >

//             <option value="">
//               Sélectionner
//             </option>

//             {liste.map(c => (
//               <option key={c.id} value={c.id}>
//                 {c.nom} — {c.statut}
//               </option>
//             ))}

//           </select>

//         </label>

//         {/* CHARGEMENT INITIAL */}

//         {chargementInitial && (
//           <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
//             <Loader2 className="h-5 w-5 animate-spin" />
//             Chargement des campagnes...
//           </div>
//         )}

//         {/* DÉTAILS */}

//         {details && (

//           <>

//             {/* STATISTIQUES */}

//             <div className="space-y-3">

//               <div className="flex items-center justify-between">

//                 <h3 className="text-sm font-medium">
//                   Statistiques de la campagne
//                 </h3>

//                 <Button
//                   type="button"
//                   size="sm"
//                   variant="ghost"
//                   disabled={busy || actualisation}
//                   onClick={() =>
//                     actualiser().catch(console.error)
//                   }
//                 >

//                   {actualisation ? (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   ) : (
//                     <RefreshCw className="mr-2 h-4 w-4" />
//                   )}

//                   Actualiser

//                 </Button>

//               </div>

//               <div className="grid grid-cols-3 gap-2">

//                 <div className="rounded-lg border p-3">

//                   <p className="text-xs text-muted-foreground">
//                     Progression
//                   </p>

//                   <p className="text-xl font-semibold">
//                     {details.progression}%
//                   </p>

//                 </div>

//                 <div className="rounded-lg border p-3">

//                   <p className="text-xs text-muted-foreground">
//                     Terminés
//                   </p>

//                   <p className="text-xl font-semibold">
//                     {details.jalonsTermines}/
//                     {details.totalJalons}
//                   </p>

//                 </div>

//                 <div className="rounded-lg border p-3">

//                   <p className="text-xs text-muted-foreground">
//                     En retard
//                   </p>

//                   <p className="text-xl font-semibold">
//                     {details.jalonsEnRetard}
//                   </p>

//                 </div>

//               </div>

//             </div>

//             {/* JALONS */}

//             <JalonBudgetaire
//               campagneId={details.campagne.id}
//               exerciceId={details.campagne.exerciceId}
//               jalons={details.jalons}
//               busy={busy}
//               onJalonTermine={actualiser}
//             />

//             {/* VALIDATION FINALE */}

//             {!fermee && (

//               <div className="space-y-3">

//                 {pret && (
//                   <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">

//                     <CheckCircle2 className="h-4 w-4" />

//                     Tous les jalons préalables sont terminés.
//                     Le budget peut être validé.

//                   </div>
//                 )}

//                 <div className="flex justify-end">

//                   <Button
//                     type="button"
//                     disabled={
//                       !pret ||
//                       busy ||
//                       actualisation
//                     }
//                     onClick={valider}
//                   >

//                     {busy || actualisation ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {busy
//                           ? "Validation..."
//                           : "Actualisation..."}
//                       </>
//                     ) : (
//                       <>
//                         <ShieldCheck className="mr-2 h-4 w-4" />
//                         Valider le budget
//                       </>
//                     )}

//                   </Button>

//                 </div>

//               </div>

//             )}

//             {/* CAMPAGNE TERMINÉE */}

//             {details.campagne.statut?.toUpperCase() ===
//               "TERMINEE" && (

//               <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">

//                 <CheckCircle2 className="h-5 w-5" />

//                 Campagne budgétaire terminée et validée.

//               </div>

//             )}

//           </>

//         )}

//       </CardContent>

//     </Card>
//   );
// }





"use client"

import { useCallback, useEffect, useState } from "react"

import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  listerCampagnes,
  detailsCampagne,
  validerCampagne,
} from "@/services/campagne-service"

import JalonBudgetaire, {
  type Jalon,
} from "./JalonBudgetaire"

// ===========================
// TYPES
// ===========================

type Campagne = {
  id: number
  exerciceId: number
  nom: string
  statut: string
}

type Details = {
  campagne: Campagne
  jalons: Jalon[]
  progression: number
  jalonsTermines: number
  totalJalons: number
  jalonsEnRetard: number
}

export default function CampagneBudgetaire({
  nouvelleId,
}: {
  nouvelleId: number | null
}) {
  const [liste, setListe] = useState<Campagne[]>([])

  const [id, setId] = useState<number | null>(
    nouvelleId
  )

  const [details, setDetails] =
    useState<Details | null>(null)

  const [error, setError] = useState("")

  const [busy, setBusy] = useState(false)

  const [actualisation, setActualisation] =
    useState(false)

  const [chargementInitial, setChargementInitial] =
    useState(true)

  // ===========================
  // POPUPS
  // ===========================

  const [popupConfirmation, setPopupConfirmation] =
    useState(false)

  const [popupSucces, setPopupSucces] =
    useState(false)

  const [erreurPopup, setErreurPopup] =
    useState("")

  // ===========================
  // ACTUALISATION
  // ===========================

  const actualiser = useCallback(async () => {
    setActualisation(true)

    try {
      const campagnes = await listerCampagnes()

      setListe(campagnes)

      if (id !== null) {
        const nouvellesDonnees =
          await detailsCampagne(id)

        setDetails(nouvellesDonnees)
      } else {
        setDetails(null)
      }

      setError("")
    } catch (e) {
      console.error(
        "Erreur actualisation campagne :",
        e
      )

      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'actualiser la campagne."
      )

      throw e
    } finally {
      setActualisation(false)
      setChargementInitial(false)
    }
  }, [id])

  // ===========================
  // SYNCHRONISATION
  // ===========================

  useEffect(() => {
    if (nouvelleId !== null) {
      setId(nouvelleId)
    }
  }, [nouvelleId])

  useEffect(() => {
    actualiser().catch(console.error)
  }, [actualiser])

  // ===========================
  // STATUT CAMPAGNE
  // ===========================

  const fermee = details
    ? ["TERMINEE", "ANNULEE"].includes(
        details.campagne.statut?.toUpperCase()
      )
    : false

  const prerequisValidation = [
    "IMPORTATION",
    "GENERATION",
    "VERIFICATION",
  ]

  const pret = details
    ? prerequisValidation.every((code) =>
        details.jalons.some(
          (j) =>
            j.code?.toUpperCase() === code &&
            j.statut?.toUpperCase() === "TERMINE"
        )
      )
    : false

  // ===========================
  // OUVRIR CONFIRMATION
  // ===========================

  const ouvrirConfirmation = () => {
    if (
      !id ||
      busy ||
      actualisation ||
      !pret ||
      fermee
    ) {
      return
    }

    setErreurPopup("")
    setPopupConfirmation(true)
  }

  // ===========================
  // VALIDATION FINALE
  // ===========================

  const valider = async () => {
    if (
      !id ||
      busy ||
      actualisation ||
      !pret ||
      fermee
    ) {
      return
    }

    setBusy(true)
    setError("")
    setErreurPopup("")

    let validationReussie = false

    try {
      // Validation côté Spring Boot
      const resultat = await validerCampagne(id)

      if (
        resultat &&
        typeof resultat === "object" &&
        "success" in resultat &&
        resultat.success === false
      ) {
        throw new Error(
          "message" in resultat &&
          typeof resultat.message === "string"
            ? resultat.message
            : "Impossible de valider le budget."
        )
      }

      validationReussie = true

      // Fermer le popup de confirmation
      setPopupConfirmation(false)

      // Afficher le popup de réussite
      setPopupSucces(true)

      // Recharger les données
      try {
        await actualiser()
      } catch (e) {
        console.error(
          "La validation a réussi, mais l'actualisation a échoué :",
          e
        )
      }
    } catch (e) {
      console.error(
        "Erreur validation campagne :",
        e
      )

      if (!validationReussie) {
        setErreurPopup(
          e instanceof Error
            ? e.message
            : "Impossible de valider le budget."
        )
      }
    } finally {
      setBusy(false)
    }
  }

  // ===========================
  // FERMETURE POPUP
  // ===========================

  useEffect(() => {
    if (!popupConfirmation && !popupSucces) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        setPopupConfirmation(false)
        setPopupSucces(false)
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [popupConfirmation, popupSucces, busy])

  // ===========================
  // RENDER
  // ===========================

  return (
    <>
      {/* ===========================
          POPUP DE CONFIRMATION
      =========================== */}

      {popupConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !busy
            ) {
              setPopupConfirmation(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-description"
            className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-background p-6 shadow-2xl duration-200"
          >
            {/* FERMER */}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setPopupConfirmation(false)
                }
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* ICÔNE */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>

              {/* TITRE */}
              <h2
                id="confirmation-title"
                className="text-xl font-semibold tracking-tight"
              >
                Confirmer la validation
              </h2>

              {/* DESCRIPTION */}
              <p
                id="confirmation-description"
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                Souhaitez-vous valider définitivement
                le budget et terminer cette campagne
                budgétaire ?
              </p>

              {/* ERREUR DE VALIDATION */}
              {erreurPopup && (
                <div
                  role="alert"
                  className="mt-5 flex w-full items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{erreurPopup}</span>
                </div>
              )}

              {/* BOUTONS */}
              <div className="mt-7 flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  disabled={busy}
                  onClick={() =>
                    setPopupConfirmation(false)
                  }
                >
                  Annuler
                </Button>

                <Button
                  type="button"
                  className="flex-1 rounded-xl"
                  disabled={busy}
                  onClick={valider}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Valider
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===========================
          POPUP DE SUCCÈS
      =========================== */}

      {popupSucces && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="succes-title"
            className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-background p-7 text-center shadow-2xl duration-200"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2
              id="succes-title"
              className="text-xl font-semibold tracking-tight"
            >
              Campagne validée !
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Le budget a été validé avec succès.
              La campagne budgétaire est maintenant
              terminée.
            </p>

            <Button
              type="button"
              className="mt-7 w-full rounded-xl"
              disabled={busy}
              onClick={() => setPopupSucces(false)}
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* ===========================
          CONTENU PRINCIPAL
      =========================== */}

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
              onChange={(e) => {
                const nouvelleValeur = e.target.value
                  ? Number(e.target.value)
                  : null

                setId(nouvelleValeur)
                setDetails(null)
                setError("")
                setErreurPopup("")
              }}
            >
              <option value="">
                Sélectionner
              </option>

              {liste.map((c) => (
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
                      <CheckCircle2 className="h-4 w-4 shrink-0" />

                      <span>
                        Tous les jalons préalables sont terminés.
                        Le budget peut être validé.
                      </span>
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
                      onClick={ouvrirConfirmation}
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
                  <CheckCircle2 className="h-5 w-5 shrink-0" />

                  <span>
                    Campagne budgétaire terminée et validée.
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
