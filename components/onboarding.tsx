'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Onboarding() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 animate-in fade-in-0 duration-1000 slide-in-from-bottom-4 max-w-4xl px-4">
        <h1 className="text-7xl font-bold tracking-tight text-[#BAFF29] animate-pulse">
          Welcome to 20 Punches! 👋
        </h1>
        <div className="space-y-8 text-xl text-muted-foreground leading-relaxed">
          <p>
            We understand that investing can feel overwhelming. But imagine having Warren Buffett—one of history&apos;s most successful investors—right by your side, guiding your investment decisions.
            <br />
            That&apos;s exactly what we&apos;re here for.
          </p>
          <p>
            At 20 Punches, we believe everyone deserves to feel optimistic about their financial future. Here&apos;s what you&apos;ll get:
          </p>
          <ul className="space-y-4 list-none text-left">
            <li>• Chat with our Warren Buffett SmartAgent for personalized investment insights</li>
            <li>• Track your investment journey with our 20 Punch Card system - inspired by Buffett&apos;s philosophy that you only need 20 great investment decisions in your lifetime</li>
            <li>• Build and monitor your investment portfolio with professional-grade tools</li>
            <li>• Access live financial data to make well-timed investment decisions</li>
            <li>• Learn value investing fundamentals that have stood the test of time</li>
          </ul>
          <p>Ready to start your journey toward becoming a confident wealth builder?</p>
          <div className="pt-4">
            <Link href="/chat">
              <Button className="bg-[#BAFF29] text-black hover:bg-[#BAFF29]/90 text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
