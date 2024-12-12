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
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(['buy', 'sell'], {
    required_error: "Trade type is required",
  }),
  shares: z.string()
    .min(1, "Number of shares is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Number of shares must be positive"),
  pricePerShare: z.string()
    .min(1, "Price per share is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Price per share must be positive"),
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
})

type TradeFormValues = z.infer<typeof formSchema>

interface NewPunchBoxProps {
  onAddPunch: (values: TradeFormValues) => void
  width?: string
  height?: string
  className?: string
  buttonClassName?: string
}

export function NewPunchBox({ 
  onAddPunch, 
  width = "284px",
  height = "72px",
  className,
  buttonClassName
}: NewPunchBoxProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<Omit<TradeFormValues, 'shares' | 'pricePerShare'> & {
    shares: string;
    pricePerShare: string;
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      shares: "",
      pricePerShare: "",
      transactionDate: new Date(),
    },
  })

  async function onSubmit(values: Omit<TradeFormValues, 'shares' | 'pricePerShare'> & {
    shares: string;
    pricePerShare: string;
  }) {
    try {
      // Validate the trade price first
      const validateResponse = await fetch('/dashboard/api/validate-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: values.symbol.toUpperCase(),
          price: Number(values.pricePerShare),
          date: values.transactionDate.toISOString()
        }),
      })

      const validation = await validateResponse.json()
      
      if (!validation.valid) {
        const { dayData } = validation
        toast({
          title: "Invalid Trade Price",
          description: `Price must be between $${dayData.low.toFixed(2)} and $${dayData.high.toFixed(2)} for this date.`,
          variant: "destructive"
        })
        return
      }

      // If price is valid, proceed with trade creation
      const trade = {
        ...values,
        symbol: values.symbol.toUpperCase(),
        shares: Number(values.shares),
        pricePerShare: Number(values.pricePerShare)
      }

      await onAddPunch(trade)
      form.reset()
      setOpen(false)
      toast({
        title: "Success",
        description: "Trade added successfully.",
      })
    } catch (error) {
      console.error('Error submitting trade:', error)
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to submit trade. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "rounded-xl overflow-hidden bg-muted/50 hover:bg-muted/80 transition-colors p-0 h-auto",
            buttonClassName
          )}
        >
          <div className="-m-1">
            <div className="relative">
              <div 
                className="flex items-center justify-center" 
                style={{ width, height }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-lg text-muted-foreground">Add Punch</span>
                </div>
              </div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Enter the details of your trade.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            {Object.keys(form.formState.errors).length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Invalid Form</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field}>{error?.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL, MSFT, GOOGL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type">
                          {field.value && (
                            <span 
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                field.value === "buy" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              )}
                            >
                              {field.value === "buy" ? "Buy" : "Sell"}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem 
                        value="buy"
                        className="focus:bg-green-100 dark:focus:bg-green-900"
                      >
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Buy
                        </span>
                      </SelectItem>
                      <SelectItem 
                        value="sell"
                        className="focus:bg-red-100 dark:focus:bg-red-900"
                      >
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Sell
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Shares</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerShare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Share</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 150.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Add Trade</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}