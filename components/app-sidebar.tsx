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
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { useMessageCount, FREE_MONTHLY_MESSAGE_LIMIT } from "@/contexts/message-count-context";

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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { messageCount } = useMessageCount();
    const [isPremium, setIsPremium] = useState(false);

    return (
        <Sidebar variant="inset" className={cn("pb-12", className)}>
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
            {isPremium ? (
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-100/10 to-amber-200/10 border border-amber-200/20">
                        <svg
                            className="w-5 h-5 text-amber-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <div>
                            <div className="font-medium text-amber-500">Premium User</div>
                            <div className="text-xs text-muted-foreground">Unlimited messages</div>
                        </div>
                    </div>
                </div>
            ) : messageCount !== null && (
                <div className="px-6 py-2">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Messages</span>
                        <span className="text-sm font-medium">
                            {messageCount}/{FREE_MONTHLY_MESSAGE_LIMIT}
                        </span>
                    </div>
                    <Progress 
                        value={(messageCount / FREE_MONTHLY_MESSAGE_LIMIT) * 100} 
                        className={cn(
                            "h-2",
                            messageCount >= FREE_MONTHLY_MESSAGE_LIMIT 
                                ? "[&>div]:bg-destructive" 
                                : "[&>div]:bg-primary"
                        )}
                    />
                    {messageCount >= FREE_MONTHLY_MESSAGE_LIMIT && (
                        <div className="mt-2 text-xs text-destructive">
                            Limit reached! Upgrade to Premium for unlimited messages.
                        </div>
                    )}
                </div>
            )}
            <form action={signOut} className="flex justify-center w-full p-4">
                <Button type="submit" className="w-[90%] h-12">
                    Sign Out
                </Button>
            </form>
        </Sidebar>
    )
}
