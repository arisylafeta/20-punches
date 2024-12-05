import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { getUser } from "@/lib/db/user";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  console.log(user);
  if (!user) {
    return (
      <html lang="en">
        <head>
          <title>20Punches</title>
        </head>
        <body>
          <div className="flex flex-col p-4 md:p-12 h-[100vh]">
            {children}
          </div>
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
        <SidebarProvider defaultOpen={true}>
          <div className="flex">
            <AppSidebar />
            <main className="flex-1">
              <SidebarTrigger />
              <div className="p-4 md:p-12">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
