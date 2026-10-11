
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"

export default function ProcessusBudgetaire() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Processus de budgétisation</CardTitle>
        <CardDescription>Le traitement comporte deux étapes principales.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Etape numero="01" titre="Importation"
            texte="Importation et validation du fichier Excel de l'exercice." />
          <Etape numero="02" titre="Génération du budget"
            texte="Calcul et génération du budget de l'exercice importé." />
        </div>
      </CardContent>
    </Card>
  )
}

function Etape({ numero, titre, texte }: {
  numero: string
  titre: string
  texte: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
        {numero}
      </div>
      <div>
        <div className="text-sm font-medium">{titre}</div>
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{texte}</div>
      </div>
    </div>
  )
}
