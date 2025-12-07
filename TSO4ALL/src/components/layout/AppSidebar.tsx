"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Radio,
  BarChart3,
  ClipboardList,
  Settings,
  ChevronRight,
  MapPin,
  Activity,
  TrendingUp,
  Calendar,
  FileText,
  Presentation,
  Target,
  GitBranch,
  RotateCcw,
  Users,
  Building2,
  Shield,
  Database,
  Bell,
  Cog,
  Briefcase,
  Award,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigationSections = [
  {
    title: "MRMR",
    icon: Radio,
    items: [
      {
        title: "Premissas",
        href: "/monitoramento",
        icon: MapPin,
      },
      {
        title: "Dashboard",
        href: "/monitoramento/tempo-real",
        icon: Activity,
      },
    ],
  },
  {
    title: "M&A",
    icon: BarChart3,
    items: [
      {
        title: "Dashboard",
        href: "/analise",
        icon: TrendingUp,
      },
      {
        title: "Downloads",
        href: "/analise/relatorios",
        icon: FileText,
      },
      {
        title: "Histórico",
        href: "/analise/historico",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Templates",
    icon: ClipboardList,
    items: [
      {
        title: "Apresentações",
        href: "/cadastro",
        icon: Presentation,
      },
      {
        title: "Excelência Operacional",
        href: "/cadastro/excelencia",
        icon: Award,
      },
      {
        title: "Workflows",
        href: "/cadastro/equipamentos",
        icon: GitBranch,
      },
      {
        title: "PDCA",
        href: "/cadastro/tipos-equipamentos",
        icon: RotateCcw,
      },
    ],
  },
  {
    title: "Cronogramas",
    icon: Settings,
    items: [
      {
        title: "Rotina BUs",
        href: "/admin",
        icon: Briefcase,
      },
      {
        title: "Rotina Corporativa",
        href: "/admin/seguranca",
        icon: Building2,
      },
      {
        title: "Ciclo PDCA",
        href: "/admin/database",
        icon: RotateCcw,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen, open } = useSidebar()
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())
  const [previousExpandedSections, setPreviousExpandedSections] = React.useState<Set<string>>(new Set())

  const handleSectionClick = (sectionTitle: string) => {
    if (!open) {
      // Sidebar is closed, expand it
      setOpen(true)
      
      // Restore previous state and add the clicked section
      setExpandedSections(prev => {
        const newSet = new Set(previousExpandedSections)
        newSet.add(sectionTitle)
        return newSet
      })
    } else {
      // Sidebar is already open, just toggle the clicked section
      setExpandedSections(prev => {
        const newSet = new Set(prev)
        if (newSet.has(sectionTitle)) {
          newSet.delete(sectionTitle)
        } else {
          newSet.add(sectionTitle)
        }
        return newSet
      })
    }
  }

  // Save expanded sections state when sidebar closes
  React.useEffect(() => {
    if (!open && expandedSections.size > 0) {
      setPreviousExpandedSections(new Set(expandedSections))
    }
  }, [open, expandedSections])

  const handleMenuItemClick = () => {
    // If sidebar is collapsed, expand it when clicking on menu items
    setOpen(true)
  }

  // Determine which section should be expanded based on current pathname
  const getActiveSection = () => {
    for (const section of navigationSections) {
      for (const item of section.items) {
        if (pathname === item.href || pathname.startsWith(item.href + "/")) {
          return section.title
        }
      }
    }
    return null
  }

  // Initialize expanded sections based on current route (only if sidebar is open)
  React.useEffect(() => {
    if (open) {
      const activeSection = getActiveSection()
      if (activeSection && !expandedSections.has(activeSection)) {
        setExpandedSections(prev => {
          const newSet = new Set(prev)
          newSet.add(activeSection)
          return newSet
        })
      }
    }
  }, [pathname, open])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/monitoramento">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Radio className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Technical Service Operations (TSO4ALL)</span>
                  <span className="text-xs text-muted-foreground">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationSections.map((section) => {
                return (
                  <Collapsible
                    key={section.title}
                    asChild
                    open={expandedSections.has(section.title)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={section.title}
                          onClick={() => handleSectionClick(section.title)}
                        >
                          <section.icon />
                          <span>{section.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            const isItemActive = pathname === item.href

                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isItemActive}>
                                  <Link href={item.href} onClick={handleMenuItemClick}>
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
