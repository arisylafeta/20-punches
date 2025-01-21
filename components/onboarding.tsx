'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Onboarding() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 animate-in fade-in-0 duration-1000 slide-in-from-bottom-4 max-w-2xl px-4">
        <h1 className="text-6xl font-bold tracking-tight text-[#BAFF29] animate-pulse">
          Welcome to 20 Punches! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal Warren Buffett-inspired investment companion. Feel free to start a conversation or add a new trade.
        </p>
        <div className="pt-4">
          <Link href="/chat">
            <Button className="bg-[#BAFF29] text-black hover:bg-[#BAFF29]/90 text-base px-6 py-5">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
