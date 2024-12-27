'use client'

import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, MessageSquare, Target } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const features = [
  {
    title: "Track Your Trades",
    description: "Keep track of up to 20 positions in your portfolio with real-time data and beautiful charts.",
    icon: BarChart3
  },
  {
    title: "AI-Powered Insights",
    description: "Get personalized trading advice from Warren, your AI investment assistant.",
    icon: MessageSquare
  },
  {
    title: "Focus on Quality",
    description: "Follow Warren Buffett's principle of concentrated investing with our 20-punch card system.",
    icon: Target
  }
]

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  <span 
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent hover:cursor-pointer relative overflow-hidden animate-shine"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {isHovered ? 'Invest' : 'Think'} like Warren Buffett
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                We turn financially anxious millennial investors into confident wealth builders.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button className="gap-2 mt-2">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Image of Product */}
        {/* Features */}
        {/* Problem section this is connected to the one below */}
        {/* Solution section */}
        {/* How Warren Works */}
        {/* Warren Quotes (Carousel) */}
        {/* Pricing */}
        {/* Persuasion */}
        {/* FAQ */}

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col items-center space-y-4 text-center">
                  <div className="p-4 bg-white rounded-full shadow-sm dark:bg-gray-900">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}