import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { getUser } from "@/lib/db/users";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { PortfolioProvider } from '@/contexts/portfolio-context';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  const user = await getUser();

  if (!user) {
    return (
      <html lang="en">
        <head>
          <title>20Punches</title>
        </head>
        <body>
          <PortfolioProvider>
            <div className="flex flex-col p-4 md:p-12 h-[100vh]">
              {children}
            </div>
            <Toaster />
          </PortfolioProvider>
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <head>
        <title>20Punches</title>
      </head>
      <body>
      <PortfolioProvider>
        <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
          <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
                <SidebarInset>
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </PortfolioProvider>
      </body>
    </html>
  );
}
