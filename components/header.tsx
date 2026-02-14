"use client"

import { useState, useEffect } from "react"
import { MountainIcon, Search, Bell, User, Settings, LogOut, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { debounce } from "lodash-es"
import { fetchCachedStocks } from "@/lib/cache-client"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sharelytics-backend.onrender.com"

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // If backend is down or unauthorized, force logout
          localStorage.removeItem("token")
          window.location.href = "/login"
        }
      } catch (error) {
        // If backend is unreachable, force logout
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    const fetchNotifications = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        // Silent fail
      }
    }

    fetchUserData()
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  const handleProfileClick = () => {
    window.location.href = "/profile"
  }

  // Navigation handler for main sections
  const handleNavigate = (section: string) => {
    if (typeof window !== "undefined") {
      if (section === "dashboard") window.location.href = "/"
      if (section === "portfolio") window.location.href = "/profile"
      if (section === "settings") window.location.href = "/profile#settings"
      if (section === "logout") handleLogout()
    }
  }

  // Only search on Enter, not on every keystroke
  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      try {
        const res = await fetch("/api/search?query=" + encodeURIComponent(searchQuery))
        if (res.ok) {
          const data = await res.json()
          if (data.symbol) {
            router.push(`/stock/${data.symbol}`)
          }
        }
      } catch {}
    }
  }

  // Debounced search for suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const { stocks } = await fetchCachedStocks()
      const matches = stocks.filter(
        s => s.symbol.toLowerCase().includes(query.toLowerCase()) ||
             s.company.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
      setSuggestions(matches)
      setShowSuggestions(true)
    } catch {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, 200)

  useEffect(() => {
    fetchSuggestions(searchQuery)
    return () => fetchSuggestions.cancel()
  }, [searchQuery])

  return (
    <header className="bg-white/90 border-b border-blue-100 sticky top-0 z-50 shadow-sm backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer" onClick={() => handleNavigate("dashboard")}> 
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-blue-900 hidden sm:block">MMAG SHARELYTICS</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 hidden md:block">
              Live Market Data
            </Badge>
          </div>
          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:bg-white focus:border-blue-400"
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleSearchKeyDown}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 border border-blue-100 max-h-72 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <div
                      key={s.symbol}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center gap-2"
                      onMouseDown={() => {
                        setShowSuggestions(false)
                        setSearchQuery("")
                        router.push(`/stock/${s.symbol}`)
                      }}
                    >
                      <span className="font-semibold text-blue-700">{s.symbol}</span>
                      <span className="text-gray-500 text-xs">{s.company}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-blue-700 hover:bg-blue-100 border-0"
                onClick={() => setShowNotifications((v) => !v)}
              >
                <Bell className="h-5 w-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-blue-900 rounded-lg shadow-lg z-50 border border-blue-100 overflow-hidden">
                  <div className="p-3 font-semibold border-b border-blue-100 bg-blue-50">Notifications</div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-blue-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">No notifications</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className={`p-3 flex items-start gap-2 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                          <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                          <div className="flex-1">
                            <div className="font-medium">{n.message}</div>
                            <div className="text-xs text-gray-500">{new Date(n.date).toLocaleString()}</div>
                          </div>
                          {!n.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:bg-blue-100"
                              onClick={async () => {
                                const token = localStorage.getItem("token")
                                await fetch(`${BACKEND_URL}/api/user/notifications/${i}/read`, {
                                  method: "PUT",
                                  headers: { Authorization: `Bearer ${token}` }
                                })
                                setNotifications((prev) => prev.map((x, idx) => idx === i ? { ...x, read: true } : x))
                              }}
                            >Mark as read</Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-blue-100 hover:border-blue-400">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.email || "User"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border-blue-100 text-blue-900" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-blue-400">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-100" />
                <DropdownMenuItem 
                  onClick={() => handleNavigate("dashboard")}
                  className="hover:bg-blue-50 cursor-pointer"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavigate("portfolio")}
                  className="hover:bg-blue-50 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavigate("settings")}
                  className="hover:bg-blue-50 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blue-100" />
                <DropdownMenuItem 
                  onClick={() => handleNavigate("logout")}
                  className="hover:bg-blue-50 cursor-pointer text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
