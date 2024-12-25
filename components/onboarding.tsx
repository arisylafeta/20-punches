'use client'

import { cn } from "@/lib/utils"

export function Onboarding() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 animate-in fade-in-0 duration-1000 slide-in-from-bottom-4">
        <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent animate-gradient">
          Welcome to 20 Punches
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
          Your journey to better investing starts here. Add your first trade above or chat with Warren to get started.
        </p>
      </div>
    </div>
  )
}
