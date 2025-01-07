'use client'

import { ChartLine, Settings, BotMessageSquare, Ticket, ChartCandlestick, Lightbulb, CircleDollarSign } from "lucide-react"
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
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Menu items.
const upper_items = [
    {
        title: "Portfolio",
        url: "/dashboard",
        icon: ChartLine,
    },
    {
        title: "Punches",
        url: "/punches",
        icon: Ticket,
    },
    // {
    //     title: "News",
    //     url: "/news",
    //     icon: Newspaper,
    // },
    {
        title: "SmartAgent",
        url: "/chat",
        icon: BotMessageSquare,
    },
    // {
    //     title: "Buffet Nuggets",
    //     url: "/buffet-nuggets",
    //     icon: Lightbulb,
    // }
]

const lower_items = [
    {
        title: "Upgrade",
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
    const pathname = usePathname()
    const router = useRouter()

    return (
        <Sidebar variant="inset">
            <SidebarHeader className="m-2 pl-4">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 pl-2">
                        <Image 
                            src="/favicon.svg" 
                            alt="Logo" 
                            width={32} 
                            height={32} 
                            className="dark:invert opacity-70" 
                        />
                        <p className="text-2xl font-bold">Punches</p>
                    </div>
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
                                    <SidebarMenuButton
                                        asChild
                                        size="lg"
                                        className={cn(
                                            "pl-6",
                                            pathname === item.url && "bg-muted"
                                        )}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span className="pl-6">{item.title}</span>
                                        </Link>
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
                                <SidebarMenuButton
                                    asChild
                                    size="lg"
                                    className={cn(
                                        "pl-6",
                                        pathname === item.url && "bg-muted"
                                    )}
                                >
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span className="pl-6">{item.title}</span>
                                    </Link>
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
