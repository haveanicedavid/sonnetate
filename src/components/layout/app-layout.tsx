import { Compass, Home, LogOut } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { db } from '@/db'
// import { useCurrentUrl } from '@/lib/hooks/use-current-tab'

type LayoutProps = {
  exploreNotifications?: number
}

export function AppLayout({ exploreNotifications = 0 }: LayoutProps) {
  // const url = useCurrentUrl()

  // const { data } = db.useQuery({
  //   summaries: {
  //     $: {
  //       where: {
  //         isShared: true,
  //       },
  //     },
  //   },
  // })

  const handleLogout = () => {
    db.auth.signOut()
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        <header className="flex justify-between items-center px-2 py-1 bg-gray-100 border-b border-gray-200">
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/summaries/mine">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 relative"
                  >
                    <Compass className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  See all your summaries
                </p>
              </TooltipContent>
            </Tooltip>
            {/* <Tooltip> */}
            {/*   <TooltipTrigger asChild> */}
            {/*     <Link to="/explore"> */}
            {/*       <Button */}
            {/*         variant="ghost" */}
            {/*         size="icon" */}
            {/*         className="h-7 w-7 relative" */}
            {/*       > */}
            {/*         <Compass className="h-4 w-4" /> */}
            {/*         {exploreNotifications > 0 && ( */}
            {/*           <Badge */}
            {/*             variant="destructive" */}
            {/*             className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" */}
            {/*           > */}
            {/*             {exploreNotifications > 99 */}
            {/*               ? '99+' */}
            {/*               : exploreNotifications} */}
            {/*           </Badge> */}
            {/*         )} */}
            {/*       </Button> */}
            {/*     </Link> */}
            {/*   </TooltipTrigger> */}
            {/*   <TooltipContent> */}
            {/*     <p> */}
            {/*       See {exploreNotifications} shared summaries from other users */}
            {/*     </p> */}
            {/*   </TooltipContent> */}
            {/* </Tooltip> */}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </header>
        <main className="flex-grow overflow-auto p-2">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
