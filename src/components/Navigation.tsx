import { useDataMutation } from "@/api/handler";
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
import { useAuth } from "@/contexts/AuthContext";
import { type SimpleResponse } from "@/lib/objects";
import { ArrowLeftRight, LogOut, Tag, User } from "lucide-react";
import { Link, useLocation } from "react-router";

type navigationOptions = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: navigationOptions[] = [
  { title: "Dashboard", url: "/dashboard", icon: User },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Categories", url: "/categories", icon: Tag },
];

export function Navigation() {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const { mutateAsync, isPending } = useDataMutation<null, SimpleResponse>(
    "auth",
    "/logout",
    false,
    {
      invalidateKey: [["summary"]],
      onSuccess: () => {
        logout();
      },
    },
  );

  async function handleLogout() {
    await mutateAsync(null);
  }

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
              {items
                .filter((item) => item.url !== pathname)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="gap-4 text-base hover:bg-neutral-800"
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="size-10 text-amber-500" />
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
              onClick={handleLogout}
              disabled={isPending}
            >
              <LogOut className="size-10" />
              {isPending ? "Logging out..." : "Logout"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
