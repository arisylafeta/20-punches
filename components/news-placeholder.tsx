'use client'

import { Newspaper } from 'lucide-react'

interface NewsPlaceholderProps {
  source: string
  className?: string
}

export function NewsPlaceholder({ source, className = "" }: NewsPlaceholderProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted p-4 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        <Newspaper className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {source}
        </p>
        <p className="text-xs text-muted-foreground/60">
          Image not available
        </p>
      </div>
    </div>
  )
}
