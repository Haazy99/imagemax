"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Menu,
  X,
  LogOut,
  Bell,
  Settings,
  Image as ImageIcon,
  Maximize2,
  Wand2,
  FileImage,
  LayoutDashboard,
  User,
  Search,
} from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const tools = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    link: "/dashboard",
  },
  {
    name: "Background Remover",
    icon: ImageIcon,
    link: "/dashboard/background-remover",
  },
  {
    name: "Image Upscaler",
    icon: Maximize2,
    link: "/dashboard/upscaler",
  },
  {
    name: "Enhancement",
    icon: Wand2,
    link: "/dashboard/enhancement",
  },
  {
    name: "Format Converter",
    icon: FileImage,
    link: "/dashboard/converter",
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const { signOut, user } = useAuth()
  const { success } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      success("Signed out successfully", "You have been signed out")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const userInitials = user?.email?.split('@')[0].slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && <span className="text-xl font-bold">ImageMax</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.link}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <tool.icon className="h-5 w-5" />
                {!isCollapsed && <span>{tool.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span>Sign out</span>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-[200px] rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Profile</SheetTitle>
                  <SheetDescription>
                    Manage your account settings and profile information.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.user_metadata?.full_name || user?.email}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Account Type</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.user_metadata?.account_type || "Free"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Member Since</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user?.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link href="/dashboard/profile">
                      <Button className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  )
} 