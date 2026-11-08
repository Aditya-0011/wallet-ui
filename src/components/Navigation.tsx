import { Link, useLocation } from "react-router";

import { ArrowLeftRight, LayoutDashboard, LogOut, Tag } from "lucide-react";

import { useLogout } from "@/hooks/use-logout";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavigationOption = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: NavigationOption[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Categories", url: "/categories", icon: Tag },
];

export function Navigation() {
  const { pathname } = useLocation();
  const { logout, isPending } = useLogout();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-neutral-800 bg-neutral-950 text-white"
    >
      <SidebarContent className="bg-neutral-950 py-1">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 text-lg text-neutral-400 group-data-[collapsible=icon]:mb-0">
            Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="gap-4 text-base hover:bg-neutral-800"
                    render={
                      <Link
                        to={item.url}
                        aria-current={
                          pathname === item.url ? "page" : undefined
                        }
                      />
                    }
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-10 text-amber-500"
                    />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-neutral-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="gap-3 text-base text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
              onClick={logout}
              disabled={isPending}
            >
              <LogOut aria-hidden="true" className="size-10" />
              <span>{isPending ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
