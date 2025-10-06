import * as React from "react"
import {
  IconHome,
  IconUpload,
  IconPackage,
  IconPackages,
  IconDeviceMobile,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
} from "@tabler/icons-react"
import { Link, useLocation } from "react-router-dom";

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

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconHome,
  },
  {
    title: "Upload Bundle",
    url: "/bundles/upload",
    icon: IconUpload,
  },
  {
    title: "Bundles",
    url: "/bundles",
    icon: IconPackage,
  },
  {
    title: "Channels",
    url: "/channels",
    icon: IconPackages,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: IconDeviceMobile,
  },
  {
    title: "Statistics",
    url: "/stats",
    icon: IconChartBar,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];

const documents = [
  {
    name: "Data Library",
    url: "#",
    icon: IconDatabase,
  },
  {
    name: "Reports",
    url: "#",
    icon: IconReport,
  },
];

const user = {
  name: "Admin User",
  email: "admin@capgo.example",
  avatar: "/avatars/capgo-admin.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <span className="text-base font-semibold">Capgo Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2">
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
        <div className="px-2 mt-4">
          {documents.map((document) => (
            <SidebarMenuItem key={document.name}>
              <SidebarMenuButton asChild>
                <a href={document.url}>
                  <document.icon />
                  <span>{document.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
