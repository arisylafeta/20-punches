import { ChartLine, Settings, BotMessageSquare, Newspaper, ChartCandlestick, Lightbulb, CircleDollarSign } from "lucide-react"
import { signOut } from "@/app/login/actions"
import { Button } from "./ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarFooter,
    SidebarHeader
} from "@/components/ui/sidebar"
import { ModeToggle } from "./theme-provider"

// Menu items.
const upper_items = [
    {
        title: "Dashboard",
        url: "/",
        icon: ChartLine,
    },
    {
        title: "Charts",
        url: "/charts",
        icon: ChartCandlestick,
    },
    {
        title: "News",
        url: "/news",
        icon: Newspaper,
    },
    {
        title: "BuffetBot",
        url: "/chat",
        icon: BotMessageSquare,
    },
    {
        title: "Buffet Nuggets",
        url: "/buffet-nuggets",
        icon: Lightbulb,
    }
]

const lower_items = [
    {
        title: "Pricing",
        url: "/pricing",
        icon: CircleDollarSign,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar variant="inset">
            <SidebarHeader className="m-2 pl-4">
            <div className="flex justify-between items-center w-full">
                <p className="text-2xl font-bold pl-2">20Punches</p>
                <ModeToggle />
            </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {upper_items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="lg" className="pl-6">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span className="pl-6 ">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
            <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {lower_items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="lg" className="pl-6">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span className="pl-6 ">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> 
                <SidebarSeparator />
                <form action={signOut} className="flex justify-center w-full p-4">
                <Button type="submit" className="w-[90%] h-12">
                    Sign Out
                </Button>
            </form>
        </Sidebar>
    )
}



