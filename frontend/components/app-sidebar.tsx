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
      title: "Piste d'audit",
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
