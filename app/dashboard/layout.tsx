import { TickerCarousel } from "@/components/ticker-carousel"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <TickerCarousel/>
      {children}
    </>
  )
}
