"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboardIcon,
  WalletCardsIcon,
  BrainCircuitIcon,
  FileSearchIcon,
  FileTextIcon,
  UsersIcon,
  CalendarRangeIcon,
  UploadIcon,
  ChartNoAxesCombinedIcon,
  GitCompareArrowsIcon,
  FileDownIcon,
  HistoryIcon,
  Settings2Icon,
  CircleHelpIcon,
  CommandIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"


const data = {

  user: {
    name: "",
    email: "",
    avatar: "",
  },

  navMain: [

    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon />
      ),
    },

    {
      title: "Exercices",
      url: "/dashboard/exercices",
      icon: (
        <CalendarRangeIcon />
      ),
    },

    {
      title: "Importation",
      url: "/dashboard/importation",
      icon: (
        <UploadIcon />
      ),
    },

    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: (
        <WalletCardsIcon />
      ),
    },

    {
      title: "Prévisions",
      url: "/dashboard/previsions",
      icon: (
        <BrainCircuitIcon />
      ),
    },

    {
      title: "Analyses",
      url: "/dashboard/analyses",
      icon: (
        <ChartNoAxesCombinedIcon />
      ),
    },

    {
      title: "Comparaisons",
      url: "/dashboard/comparaisons",
      icon: (
        <GitCompareArrowsIcon />
      ),
    },
  ],


  documents: [

    {
      name: "Reverse Engineering",
      url: "/dashboard/reverse-engineering",
      icon: (
        <FileSearchIcon />
      ),
    },

    {
      name: "Rapports",
      url: "/dashboard/rapports",
      icon: (
        <FileTextIcon />
      ),
    },

    {
      name: "Exports",
      url: "/dashboard/exports",
      icon: (
        <FileDownIcon />
      ),
    },

    {
      name: "Campagnes",
      url: "/dashboard/campagnes",
      icon: (
        <CalendarRangeIcon />
      ),
    },
  ],

  navSecondary: [

    {
      title: "Utilisateurs",
      url: "/dashboard/utilisateurs",
      icon: (
        <UsersIcon />
      ),
    },

    {
      title: "Traçabilité",
      url: "/dashboard/tracabilite",
      icon: (
        <HistoryIcon />
      ),
    },

    {
      title: "Paramètres",
      url: "/dashboard/parametres",
      icon: (
        <Settings2Icon />
      ),
    },

    {
      title: "Aide",
      url: "/dashboard/aide",
      icon: (
        <CircleHelpIcon />
      ),
    },
  ],
}


export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >

      {/* ====================================================== */}
      {/* Logo / nom application */}
      {/* ====================================================== */}

      {/* <SidebarHeader>

        <SidebarMenu>

          <SidebarMenuItem>

            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <a href="/dashboard" />
              }
            >

              <CommandIcon className="size-5!" />

              <span className="text-base font-semibold">
                SXMXDX
              </span>

            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}



{/* ====================================================== */}
{/* Logo / nom application */}
{/* ====================================================== */}

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
        <NavMain
          items={data.navMain}
        />
        <NavDocuments
          items={data.documents}
        />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={data.user}
        />
      </SidebarFooter>
    </Sidebar>
  )
}