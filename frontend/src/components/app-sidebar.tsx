"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  MapPinned,
  PlusSquare,
  Settings,
  TestTube2,
  User as UserIcon,
  Users,
  History,
  LogIn,
  LogOut,
  ChevronsUpDown,
} from "lucide-react"

export function AppSidebar() {
  const { isAuthenticated, hasRole, logout, user, userDisplayName } = useAuth()
  const hasTravelerType = !!(user?.traveler_type_id || user?.traveler_type)

  const mainItems = [
    { title: "Inicio", href: "/", icon: Home },
    { title: "Itinerarios", href: "/itineraries", icon: MapPinned },
    { title: "Crear itinerario", href: "/create", icon: PlusSquare },
    {
      title: hasTravelerType ? "Tipo de Viajero" : "Test de viajero",
      href: hasTravelerType ? "/traveler-type" : "/traveler-test",
      icon: TestTube2,
    },
  ] as const

  const adminItems = [
    { title: "Historial de tests", href: "/admin/test-history", icon: History },
    { title: "Usuarios", href: "/admin/users", icon: Users },
  ] as const

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explorar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Cuenta y Admin se mueven al footer desplegable */}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-6">
                    <AvatarImage src={"/avatars/spedemonte_avatar.png"} alt={userDisplayName} />
                    <AvatarFallback>
                      {userDisplayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {userDisplayName || "Invitado"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || "Haz clic para iniciar sesión"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="size-8">
                      <AvatarImage src={"/avatars/spedemonte_avatar.png"} alt={userDisplayName} />
                      <AvatarFallback>
                        {userDisplayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{userDisplayName || "Invitado"}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || ""}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isAuthenticated ? (
                  <DropdownMenuItem asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 size-4" /> Iniciar sesión
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <UserIcon className="mr-2 size-4" /> Cuenta
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 size-4" /> Ajustes
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {hasRole("admin") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        {adminItems.map((item) => (
                          <DropdownMenuItem asChild key={item.title}>
                            <Link href={item.href}>
                              <item.icon className="mr-2 size-4" /> {item.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 size-4" /> Cerrar sesión
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}