// import { AlertCircle } from "lucide-react"

// type BudgetErrorProps = {
//   message: string
// }

// export default function BudgetError({
//   message,
// }: BudgetErrorProps) {
//   if (!message) {
//     return null
//   }

//   return (
//     <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
//       <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//       <div>
//         <p className="font-medium">
//           Une erreur est survenue
//         </p>

//         <p className="mt-1 text-sm">
//           {message}
//         </p>
//       </div>
//     </div>
//   )
// }




import {
  AlertCircle,
} from "lucide-react"

type BudgetErrorProps = {
  message: string
}

export default function BudgetError({
  message,
}: BudgetErrorProps) {
  if (!message) {
    return null
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

      <div>
        <p className="font-medium">
          Une erreur est survenue
        </p>

        <p className="mt-1 text-sm">
          {message}
        </p>
      </div>
    </div>
  )
}