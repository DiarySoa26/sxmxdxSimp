// import BudgetDetails from "@/components/budget/budget-details"

// export default function BudgetPage() {
//   return (
//     <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">
//           Budget
//         </h1>

//         <p className="text-sm text-muted-foreground">
//           Consultation des données budgétaires par exercice
//         </p>
//       </div>

//       <BudgetDetails />
//     </div>
//   )
// }


import BudgetDetails from "@/components/budget/budget-details"

export default function BudgetPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Budget
        </h1>

        <p className="text-sm text-muted-foreground">
          Consultation des données budgétaires par exercice
        </p>
      </div>

      <BudgetDetails />
    </div>
  )
}