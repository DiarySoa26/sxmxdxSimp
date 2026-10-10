// import { SessionGuard } from "@/components/session-guard"

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <SessionGuard>
//       {children}
//     </SessionGuard>
//   )
// }




import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>

      <AppSidebar />

      <SidebarInset>
        {children}
      </SidebarInset>

    </SidebarProvider>
  )
}