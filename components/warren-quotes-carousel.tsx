'use client'

import { Card } from "@/components/ui/card"
import { Quote } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface WarrenQuote {
  quote: string
  lesson: string
}

const quotes: WarrenQuote[] = [
  {
    quote: "The most important investment you can make is in yourself.",
    lesson: "Invest in your knowledge and skills continuously."
  },
  {
    quote: "Price is what you pay. Value is what you get.",
    lesson: "Focus on the intrinsic value, not just the market price."
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    lesson: "Always understand your investments thoroughly."
  },
  {
    quote: "Only buy something that you'd be perfectly happy to hold if the market shut down for 10 years.",
    lesson: "Invest with a long-term perspective."
  },
  {
    quote: "The best chance to deploy capital is when things are going down.",
    lesson: "Market downturns can present the best opportunities."
  }
]

export function WarrenQuotesCarousel() {
  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
          {quotes.map((quote, i) => (
            <CarouselItem key={i} className="pl-1 sm:pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="h-full">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white h-full">
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col h-full justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Quote className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 opacity-50 flex-shrink-0" />
                        <p className="text-sm sm:text-base md:text-lg font-medium italic leading-relaxed">{quote.quote}</p>
                      </div>
                      <div className="pt-3 sm:pt-4 border-t border-white/20">
                        <p className="text-xs sm:text-sm font-light mb-1">Lesson:</p>
                        <p className="text-sm sm:text-base">{quote.lesson}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-3 sm:left-0 md:left-2" />
          <CarouselNext className="-right-3 sm:right-0 md:right-2" />
        </div>
      </Carousel>
    </div>
  )
}
