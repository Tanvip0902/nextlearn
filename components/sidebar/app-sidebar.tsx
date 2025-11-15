"use client"
import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/public/logo.jpg"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: IconListDetails,
    },
  
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "/admin/capture", // Updated with proper path
      items: [
        {
          title: "Active Proposals",
          url: "/admin/capture/active",
        },
        {
          title: "Archived",
          url: "/admin/capture/archived",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "/admin/proposals", // Updated with proper path
      items: [
        {
          title: "Active Proposals",
          url: "/admin/proposals/active",
        },
        {
          title: "Archived",
          url: "/admin/proposals/archived",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "/admin/prompts", // Updated with proper path
      items: [
        {
          title: "Active Proposals",
          url: "/admin/prompts/active",
        },
        {
          title: "Archived",
          url: "/admin/prompts/archived",
        },
      ],
    },
  ],
navSecondary: [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/help", // 🔥 updated path
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "/dashboard/search",
    icon: IconSearch,
  },
],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="size-5"
                />
                <span className="text-base font-semibold">NextLearn.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}