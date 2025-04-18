"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  isActive?: boolean
  items?: NavItem[]
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.items && item.items.length > 0 ? (
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenu>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem, subIndex) => (
                        <SidebarMenuSubItem key={subIndex}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                            <Link href={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </SidebarMenu>
            </Collapsible>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.url}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </React.Fragment>
      ))}
    </>
  )
}
