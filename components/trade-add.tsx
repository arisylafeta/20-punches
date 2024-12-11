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
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
})

interface TickerAddProps {
  onAddTicker: (symbol: string) => void
}

export function TickerAdd({ onAddTicker }: TickerAddProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTicker(values.symbol.trim())
    setOpen(false)
    form.reset()
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
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-lg text-muted-foreground">Add Trade</span>
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
            Enter the symbol for the stock you want to track.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* TODO: Add other inputs for trades. Use this in 20 Punches */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL, MSFT, GOOGL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid stock market symbol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Ticker</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
