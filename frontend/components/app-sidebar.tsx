// "use client"

// import * as React from "react"

// import { NavDocuments } from "@/components/nav-documents"
// import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// import {
//   LayoutDashboardIcon,
//   WalletCardsIcon,
//   BrainCircuitIcon,
//   FileSearchIcon,
//   FileTextIcon,
//   UsersIcon,
//   CalendarRangeIcon,
//   UploadIcon,
//   ChartNoAxesCombinedIcon,
//   GitCompareArrowsIcon,
//   FileDownIcon,
//   HistoryIcon,
//   Settings2Icon,
//   CircleHelpIcon,
//   CommandIcon,
// } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"


// const data = {

//   user: {
//     name: "",
//     email: "",
//     avatar: "",
//   },

//   navMain: [

//     {
//       title: "Tableau de bord",
//       url: "/dashboard",
//       icon: (
//         <LayoutDashboardIcon />
//       ),
//     },

//     {
//       title: "Exercices",
//       url: "/dashboard/exercices",
//       icon: (
//         <CalendarRangeIcon />
//       ),
//     },

//     {
//       title: "Importation",
//       url: "/dashboard/importation",
//       icon: (
//         <UploadIcon />
//       ),
//     },

//     {
//       title: "Budgets",
//       url: "/dashboard/budgets",
//       icon: (
//         <WalletCardsIcon />
//       ),
//     },

//     {
//       title: "Prévisions",
//       url: "/dashboard/previsions",
//       icon: (
//         <BrainCircuitIcon />
//       ),
//     },

//     {
//       title: "Analyses",
//       url: "/dashboard/analyses",
//       icon: (
//         <ChartNoAxesCombinedIcon />
//       ),
//     },

//     {
//       title: "Comparaisons",
//       url: "/dashboard/comparaisons",
//       icon: (
//         <GitCompareArrowsIcon />
//       ),
//     },
//   ],


//   documents: [

//     {
//       name: "Reverse Engineering",
//       url: "/dashboard/reverse-engineering",
//       icon: (
//         <FileSearchIcon />
//       ),
//     },

//     {
//       name: "Rapports",
//       url: "/dashboard/rapports",
//       icon: (
//         <FileTextIcon />
//       ),
//     },

//     {
//       name: "Exports",
//       url: "/dashboard/exports",
//       icon: (
//         <FileDownIcon />
//       ),
//     },

//     {
//       name: "Campagnes",
//       url: "/dashboard/campagnes",
//       icon: (
//         <CalendarRangeIcon />
//       ),
//     },
//   ],

//   navSecondary: [

//     {
//       title: "Utilisateurs",
//       url: "/dashboard/utilisateurs",
//       icon: (
//         <UsersIcon />
//       ),
//     },

//     {
//       title: "Traçabilité",
//       url: "/dashboard/tracabilite",
//       icon: (
//         <HistoryIcon />
//       ),
//     },

//     {
//       title: "Paramètres",
//       url: "/dashboard/parametres",
//       icon: (
//         <Settings2Icon />
//       ),
//     },

//     {
//       title: "Aide",
//       url: "/dashboard/aide",
//       icon: (
//         <CircleHelpIcon />
//       ),
//     },
//   ],
// }


// export function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {

//   return (
//     <Sidebar
//       collapsible="offcanvas"
//       {...props}
//     >

//       {/* ====================================================== */}
//       {/* Logo / nom application */}
//       {/* ====================================================== */}

//       {/* <SidebarHeader>

//         <SidebarMenu>

//           <SidebarMenuItem>

//             <SidebarMenuButton
//               className="data-[slot=sidebar-menu-button]:p-1.5!"
//               render={
//                 <a href="/dashboard" />
//               }
//             >

//               <CommandIcon className="size-5!" />

//               <span className="text-base font-semibold">
//                 SXMXDX
//               </span>

//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader> */}



// {/* ====================================================== */}
// {/* Logo / nom application */}
// {/* ====================================================== */}

// <SidebarHeader className="p-2">
//   <SidebarMenu>
//     <SidebarMenuItem>
//       <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg px-2">
//         <Image
//           src="/images/LogoSomida2.png"
//           alt="SOMIDA"
//           width={600}
//           height={200}
//           priority
//           className="h-full w-full object-contain"
//         />
//       </div>
//     </SidebarMenuItem>
//   </SidebarMenu>
// </SidebarHeader>

      
//       <SidebarContent>
//         <NavMain
//           items={data.navMain}
//         />
//         <NavDocuments
//           items={data.documents}
//         />
//         <NavSecondary
//           items={data.navSecondary}
//           className="mt-auto"
//         />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser
//           user={data.user}
//         />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }






// "use client"

// import * as React from "react"
// import Image from "next/image"

// import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"

// import {
//   Sidebar, SidebarContent, SidebarFooter,
//   SidebarHeader, SidebarMenu, SidebarMenuItem,
// } from "@/components/ui/sidebar"

// import {
//   WalletCardsIcon, BrainCircuitIcon,
//   FileSearchIcon, UsersIcon, CalendarRangeIcon,
//   UploadIcon, ChartNoAxesCombinedIcon,
//   GitCompareArrowsIcon, HistoryIcon,
//   Settings2Icon, CircleHelpIcon,
// } from "lucide-react"

// const data = {
//   user: {
//     name: "",
//     email: "",
//     avatar: "",
//   },

//   navMain: [
//     {
//       title: "Exercices",
//       url: "/dashboard/exercices",
//       icon: <CalendarRangeIcon />,
//     },
//     {
//       title: "Importation",
//       url: "/dashboard/importation",
//       icon: <UploadIcon />,
//     },
//     {
//       title: "Budgets",
//       url: "/dashboard/budgets",
//       icon: <WalletCardsIcon />,
//     },
//     {
//       title: "Prévisions",
//       url: "/dashboard/previsions",
//       icon: <BrainCircuitIcon />,
//     },
//     {
//       title: "Analyses",
//       url: "/dashboard/analyses",
//       icon: <ChartNoAxesCombinedIcon />,
//     },
//     {
//       title: "Comparaisons",
//       url: "/dashboard/comparaisons",
//       icon: <GitCompareArrowsIcon />,
//     },
//     {
//       title: "Reverse Engineering",
//       url: "/dashboard/reverse-engineering",
//       icon: <FileSearchIcon />,
//     },
//   ],

//   navSecondary: [
//     {
//       title: "Utilisateurs",
//       url: "/dashboard/utilisateurs",
//       icon: <UsersIcon />,
//     },
//     {
//       title: "Traçabilité",
//       url: "/dashboard/tracabilite",
//       icon: <HistoryIcon />,
//     },
//     {
//       title: "Paramètres",
//       url: "/dashboard/parametres",
//       icon: <Settings2Icon />,
//     },
//     {
//       title: "Aide",
//       url: "/dashboard/aide",
//       icon: <CircleHelpIcon />,
//     },
//   ],
// }

// export function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar collapsible="offcanvas" {...props}>
//       <SidebarHeader className="p-2">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg px-2">
//               <Image
//                 src="/images/LogoSomida2.png"
//                 alt="SOMIDA"
//                 width={600}
//                 height={200}
//                 priority
//                 className="h-full w-full object-contain"
//               />
//             </div>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         <NavMain items={data.navMain} />
//         <NavSecondary
//           items={data.navSecondary}
//           className="mt-auto"
//         />
//       </SidebarContent>

//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }





"use client"

import * as React from "react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  WalletCardsIcon, BrainCircuitIcon,
  FileSearchIcon, UsersIcon, CalendarRangeIcon,
  UploadIcon, ChartNoAxesCombinedIcon,
  GitCompareArrowsIcon, HistoryIcon,
  Settings2Icon, CircleHelpIcon,
} from "lucide-react"

import { getSession } from "@/lib/session"

type Role = "ADMIN" | "DAF" | "COMPTABLE" | "LECTEUR"

type User = {
  id?: number
  name: string
  email: string
  avatar: string
  role: Role
}

const ROLES: Role[] = ["ADMIN", "DAF", "COMPTABLE", "LECTEUR"]

const data = {
  navMain: [
    {
      title: "Exercices",
      url: "/dashboard/exercices",
      icon: <CalendarRangeIcon />,
      roles: ["ADMIN", "DAF", "COMPTABLE", "LECTEUR"],
    },
    {
      title: "Importation",
      url: "/dashboard/importation",
      icon: <UploadIcon />,
      roles: ["ADMIN", "COMPTABLE"],
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: <WalletCardsIcon />,
      roles: ["ADMIN", "DAF", "COMPTABLE", "LECTEUR"],
    },
    {
      title: "Prévisions",
      url: "/dashboard/previsions",
      icon: <BrainCircuitIcon />,
      roles: ["ADMIN", "DAF", "LECTEUR"],
    },
    {
      title: "Analyses",
      url: "/dashboard/analyses",
      icon: <ChartNoAxesCombinedIcon />,
      roles: ["ADMIN", "DAF", "COMPTABLE", "LECTEUR"],
    },
    {
      title: "Comparaisons",
      url: "/dashboard/comparaisons",
      icon: <GitCompareArrowsIcon />,
      roles: ["ADMIN", "DAF", "LECTEUR"],
    },
    {
      title: "Reverse Engineering",
      url: "/dashboard/reverse-engineering",
      icon: <FileSearchIcon />,
      roles: ["ADMIN"],
    },
  ],

  navSecondary: [
    {
      title: "Utilisateurs",
      url: "/dashboard/utilisateurs",
      icon: <UsersIcon />,
      roles: ["ADMIN"],
    },
    {
      title: "Traçabilité",
      url: "/dashboard/tracabilite",
      icon: <HistoryIcon />,
      roles: ["ADMIN", "DAF"],
    },
    {
      title: "Paramètres",
      url: "/dashboard/parametres",
      icon: <Settings2Icon />,
      roles: ["ADMIN"],
    },
    {
      title: "Aide",
      url: "/dashboard/aide",
      icon: <CircleHelpIcon />,
      roles: ["ADMIN", "DAF", "COMPTABLE", "LECTEUR"],
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const chargerSession = () => {
      const session = getSession()

      if (!session) {
        setUser(null)
        return
      }

      const role = String(session.role || "")
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, "")

      if (!ROLES.includes(role as Role)) {
        console.warn("Rôle non reconnu :", role)
        setUser(null)
        return
      }

      setUser({
        id: session.id,
        name: session.name || "",
        email: session.email || "",
        avatar: session.avatar || "",
        role: role as Role,
      })
    }

    chargerSession()

    window.addEventListener("storage", chargerSession)
    window.addEventListener("user-updated", chargerSession)

    return () => {
      window.removeEventListener("storage", chargerSession)
      window.removeEventListener("user-updated", chargerSession)
    }
  }, [])

  const navMain = React.useMemo(
    () => data.navMain.filter(
      item => user && item.roles.includes(user.role)
    ),
    [user]
  )

  const navSecondary = React.useMemo(
    () => data.navSecondary.filter(
      item => user && item.roles.includes(user.role)
    ),
    [user]
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg px-2">
              <Image
                src="/images/LogoSomida2.png"
                alt="SOMIDA"
                width={600}
                height={200}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {user && (
          <>
            <NavMain items={navMain} />
            <NavSecondary
              items={navSecondary}
              className="mt-auto"
            />
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
