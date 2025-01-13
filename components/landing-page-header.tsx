import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'

const LandingPageHeader = () => {
    return (<header className="flex sticky top-0 bg-background p-4 items-center px-2 md:px-2 gap-2 border-b border-gray-200 dark:border-white/20 z-50">
        <div className="flex items-center gap-2 pl-2">
     <Image 
         src="/favicon.svg" 
         alt="Logo" 
         width={32} 
         height={32} 
         className="dark:invert opacity-70" 
     />
     <p className="text-2xl font-bold">Punches</p>
 </div>
 <Link href="/login">
                  <Button className="w-full sm:w-auto gap-2">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Button>
    </Link>
</header>)
}

export default LandingPageHeader