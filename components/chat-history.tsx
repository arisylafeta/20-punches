import { History } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BetterTooltip } from "./ui/tooltip"


export function ChatHistory() {

  return (

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <BetterTooltip content="Previous Conversations">
        <Button variant="outline">
          <History className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Choose from Previous Conversations</span>
        </Button>
      </BetterTooltip>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}
