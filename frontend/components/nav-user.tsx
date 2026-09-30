"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

import {
  removeSession,
  getSession,
} from "@/lib/session"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  const router = useRouter()

  function handleLogout() {
    removeSession(),

    router.replace("/login")
  }


  type ConnectedUser = {
    id: number
    name: string
    email: string
    role: string
  }

  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>(null)

  useEffect(() => {
    const session = getSession()

    if (!session) {
      router.replace("/login")
      return
    }

    setConnectedUser(session)
  }, [router])
  
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={user.avatar} alt={connectedUser?.name ?? user.name} />
              <AvatarFallback className="rounded-lg"> 
                {connectedUser?.role === "ADMIN"
                  ? "AD"
                  : connectedUser?.role === "COMPTABLE"
                    ? "CO"
                    : connectedUser?.role === "LECTEUR"
                      ? "LE"
                      : "GU"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{connectedUser?.name ?? user.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {connectedUser?.email ?? user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={connectedUser?.name ?? user.name} />
                    <AvatarFallback className="rounded-lg">
                      {connectedUser?.role === "ADMIN" ? "AD" : connectedUser?.role === "COMPTABLE" ? "CO" : connectedUser?.role === "LECTEUR" ? "LE" : "GU"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{connectedUser?.name ?? user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {connectedUser?.email ?? user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon
                />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon
                />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon
                />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon
              />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
