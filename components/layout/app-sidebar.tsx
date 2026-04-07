'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import {
  LayoutDashboard,
  UserPlus,
  ListOrdered,
  DollarSign,
  Trophy,
  Kanban,
  Users,
  Settings,
  LogOut,
  Table,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const indicadoraNavItems = [
  { href: '/indicadora/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/indicadora/novo-lead', label: 'Novo Lead', icon: UserPlus },
  { href: '/indicadora/minhas-indicacoes', label: 'Minhas Indicações', icon: ListOrdered },
  { href: '/indicadora/comissoes', label: 'Minhas Comissões', icon: DollarSign },
  { href: '/indicadora/ranking', label: 'Ranking', icon: Trophy },
  { href: '/indicadora/configuracoes', label: 'Configurações', icon: Settings },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/kanban', label: 'Kanban', icon: Kanban },
  { href: '/admin/leads', label: 'Todos os Leads', icon: Table },
  { href: '/admin/indicadoras', label: 'Indicadoras', icon: Users },
  { href: '/admin/comissoes', label: 'Comissões', icon: DollarSign },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const navItems = user?.role === 'admin' ? adminNavItems : indicadoraNavItems
  const roleLabel = user?.role === 'admin' ? 'Administrador' : 'Indicadora'

  return (
    <Sidebar className="border-r border-sidebar-border/20">
      <SidebarHeader className="border-b border-sidebar-border/20 bg-gradient-to-b from-sidebar/60 to-sidebar/40 py-4">
        <Link href="/" className="flex items-center gap-3 px-2">
          <Image
            src="/images/logo-icon.png"
            alt="Economize"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <span className="text-lg font-bold text-[#22C55E]">Economize</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
            {roleLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'transition-all duration-200 px-3 py-2 rounded-lg',
                      pathname === item.href 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg' 
                        : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border/20 bg-gradient-to-t from-sidebar/40 to-sidebar/20">
        <div className="flex flex-col gap-3 p-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.name || 'Usuário'}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
