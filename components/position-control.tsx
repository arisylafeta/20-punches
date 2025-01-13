'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { NewPunchBox } from "@/components/new-punch-box"
import { getPosition } from "@/lib/db/trades"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface PositionControlProps {
  symbol: string
  className?: string
}

export function PositionControl({ symbol, className }: PositionControlProps) {
  const [position, setPosition] = useState<{ shares: number; value: number; currentPrice: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [price, setPrice] = useState<string>("")
  const [shares, setShares] = useState<string>("1")

  // Fetch historical price when date changes
  useEffect(() => {
    const fetchHistoricalPrice = async () => {
      // If selected date is in the future, show warning and use current price
      const now = new Date()
      if (selectedDate > now) {
        console.log('Selected date is in the future, using current price');
        toast({
          title: "Invalid Date",
          description: "Cannot select a future date. Using current price instead.",
          variant: "destructive",
        })
        return;
      }

      try {
        // Set the time to noon to avoid timezone issues
        const dateToFetch = new Date(selectedDate)
        dateToFetch.setHours(12, 0, 0, 0)

        const response = await fetch('/dashboard/api/yfinance-historical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbols: [symbol],
            startDate: dateToFetch.toISOString(),
            endDate: dateToFetch.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch historical price');
        }

        const { data } = await response.json();
        const symbolData = data[symbol];
        
        if (symbolData.error) {
          console.error('Error fetching historical price:', symbolData.error);
          return;
        }

        if (symbolData.data && symbolData.data.length > 0) {
          // Get the first (and should be only) price for that day
          const historicalPrice = symbolData.data[0].close;
          if (historicalPrice) {
            setPrice(historicalPrice.toFixed(2));
          } else {
            console.warn('No closing price available for the selected date');
          }
        } else {
          console.warn('No historical price data available for the selected date');
        }
      } catch (error) {
        console.error('Error fetching historical price:', error);
      }
    };

    fetchHistoricalPrice();
  }, [selectedDate, symbol]);

  useEffect(() => {
    const loadPosition = async () => {
      try {
        console.log('Loading position for symbol:', symbol)
        const pos = await getPosition(symbol)
        console.log('Position loaded:', pos)
        setPosition(pos)
        setPrice(pos.currentPrice.toFixed(2))
      } catch (error) {
        console.error('Error loading position:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosition()
  }, [symbol])

  const handleTrade = async (values: any) => {
    console.log('Trade executed:', values)
    // After trade is completed, refresh the position
    const updatedPosition = await getPosition(symbol)
    console.log('Updated position:', updatedPosition)
    setPosition(updatedPosition)
  }

  const adjustPrice = (increment: boolean) => {
    const currentPrice = parseFloat(price)
    if (isNaN(currentPrice)) return
    const newPrice = increment 
      ? (currentPrice + 0.1).toFixed(2)
      : (currentPrice - 0.1).toFixed(2)
    setPrice(newPrice)
  }

  const adjustShares = (increment: boolean) => {
    const currentShares = parseInt(shares)
    if (isNaN(currentShares)) return
    const newShares = increment 
      ? currentShares + 1
      : Math.max(1, currentShares - 1)
    setShares(newShares.toString())
  }

  if (isLoading) {
    return <div className="animate-pulse h-[500px] bg-muted rounded-lg" />
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <Card className="w-full p-4 space-y-6 flex-1 h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Your Position</h2>
          <div className="text-4xl font-bold mb-1">${position?.value?.toFixed(2) ?? '0.00'}</div>
          <div className="text-sm text-gray-500">
            <span className="text-gray-400">({position?.shares ?? 0} shares)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Trade Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Number of Shares</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustShares(false)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                min="1"
                step="1"
                className="text-center"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustShares(true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Price per Share</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustPrice(false)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="text-center"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustPrice(true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-2 w-full">
        <NewPunchBox
          onAddPunch={handleTrade}
          width="100%"
          className="text-white font-medium"
          buttonClassName="bg-green-500 hover:bg-green-600 text-white flex-1"
          initialValues={{
            symbol,
            type: 'buy',
            transactionDate: selectedDate,
            pricePerShare: parseFloat(price),
            shares: parseInt(shares)
          }}
        />
        
        <NewPunchBox
          onAddPunch={handleTrade}
          width="100%"
          className="text-white font-medium"
          buttonClassName="bg-red-500 hover:bg-red-600 text-white flex-1"
          initialValues={{
            symbol,
            type: 'sell',
            transactionDate: selectedDate,
            pricePerShare: parseFloat(price),
            shares: parseInt(shares)
          }}
        />
      </div>
    </div>
  )
}
