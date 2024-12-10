'use client'

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface TickerAddProps {
  onAddTicker: (symbol: string) => void
}

export function TickerAdd({ onAddTicker }: TickerAddProps) {
  const [open, setOpen] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSymbol.trim()) {
      onAddTicker(newSymbol.trim())
      setOpen(false)
      setNewSymbol("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex-none rounded-xl overflow-hidden mx-2 first:ml-0 last:mr-0 mb-3 mt-3 bg-muted/50 hover:bg-muted/80 transition-colors p-0 h-auto"
        >
          <div className="-m-1">
            <div className="relative">
              <div className="tradingview-widget-container h-full">
                <div 
                  className="tradingview-widget-container__widget flex items-center justify-center" 
                  style={{ minHeight: "72px", width: "284px" }}
                >
                  <Plus className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ticker</DialogTitle>
          <DialogDescription>
            Enter the symbol for the stock or cryptocurrency you want to track.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input 
              id="symbol"
              placeholder="e.g., BINANCE:BTCUSDT"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Add Ticker</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
