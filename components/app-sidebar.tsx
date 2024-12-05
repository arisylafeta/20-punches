import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
  import { signOut } from "@/app/login/actions"
import { Button } from "./ui/button"
   
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <form action={signOut} className="flex items-center gap-2">
                    <Button type="submit">
                        Sign Out
                    </Button>
                </form>
        <SidebarFooter />
      </Sidebar>
    )
  }
  