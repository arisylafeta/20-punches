import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { cookies } from "next/headers"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  
  return (
    <div className="flex min-h-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="flex-1">
            <SidebarInset>
              {children}
            </SidebarInset>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}