"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  Eye, 
  Settings,
  Bell,
  Shield,
  Camera,
  Edit3,
  Save,
  X
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sharelytics-backend.onrender.com"

interface UserProfile {
  email: string
  name?: string
  createdAt: string
  portfolio: any[]
  watchlist: string[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "" })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState("")
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setEditForm({ name: userData.name || "", email: userData.email })
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm({ name: user?.name || "", email: user?.email || "" })
    setEditing(false)
  }

  const handleChangePassword = async () => {
    setChangePasswordLoading(true)
    setChangePasswordError("")
    setChangePasswordSuccess("")

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (response.ok) {
        setCurrentPassword("")
        setNewPassword("")
        setShowChangePassword(false)
        setChangePasswordSuccess("Password changed successfully")
        toast({
          title: "Success",
          description: "Password changed successfully"
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      const message = error instanceof Error ? error.message : String(error)
      setChangePasswordError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    } finally {
      setChangePasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 text-center text-gray-900 shadow-lg">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const portfolioValue = user?.portfolio?.reduce((sum, stock) => sum + (stock.value || 0), 0) || 0
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 text-gray-900 shadow-lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-blue-100">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.name || user?.email} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-blue-100 hover:bg-blue-200 border-2 border-white"
              >
                <Camera className="h-4 w-4 text-blue-600" />
              </Button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.name || user?.email?.split("@")?.[0] || "User"}
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 w-fit">
                  Active Trader
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-700">Member since {joinDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-700">Portfolio: ₹{portfolioValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg text-gray-900 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Portfolio Holdings</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.portfolio?.length || 0}</div>
              <p className="text-xs text-gray-400">Active positions</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-lg text-gray-900 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Watchlist</CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.watchlist?.length || 0}</div>
              <p className="text-xs text-gray-400">Stocks tracked</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-lg text-gray-900 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">₹{portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Current value</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-lg text-gray-900 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Trading Since</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{joinDate.split("/")[2] || new Date().getFullYear()}</div>
              <p className="text-xs text-gray-400">Years of experience</p>
            </CardContent>
          </Card>
        </div>
        {/* Profile Tabs */}
        <Card className="bg-white border-0 shadow-lg text-gray-900">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-blue-50 border-0">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100">Overview</TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-100">Portfolio</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100">Settings</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-100">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Portfolio updated</p>
                      <p className="text-sm text-gray-500">Added new stocks to tracking</p>
                    </div>
                    <span className="text-sm text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Watchlist modified</p>
                      <p className="text-sm text-gray-500">Added 3 new stocks to watchlist</p>
                    </div>
                    <span className="text-sm text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="portfolio" className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Total Holdings</h4>
                    <p className="text-2xl font-bold">{user?.portfolio?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Watchlist Items</h4>
                    <p className="text-2xl font-bold">{user?.watchlist?.length || 0}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                {editing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email</Label>
                      <Input
                        id="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900"
                        placeholder="Enter your email"
                        disabled
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Name</h4>
                          <p className="text-gray-500">{user?.name || "Not set"}</p>
                        </div>
                        <Button onClick={() => setEditing(true)} variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium">Email</h4>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="security" className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                        Enable
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-500">Update your account password</p>
                      </div>
                      <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" onClick={() => setShowChangePassword(true)}>
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            {/* Change Password Modal */}
            {showChangePassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowChangePassword(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Change Password</h3>
                  {changePasswordSuccess && (
                    <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">{changePasswordSuccess}</div>
                  )}
                  {changePasswordError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{changePasswordError}</div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Current Password</label>
                      <input type="password" className="w-full border rounded px-3 py-2" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">New Password</label>
                      <input type="password" className="w-full border rounded px-3 py-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                      onClick={async () => {
                        setChangePasswordLoading(true)
                        setChangePasswordError("")
                        setChangePasswordSuccess("")
                        try {
                          const token = localStorage.getItem("token")
                          const res = await fetch(`${BACKEND_URL}/api/user/change-password`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ currentPassword, newPassword })
                          })
                          const data = await res.json()
                          if (!res.ok) throw new Error(data.error || "Failed to change password")
                          setChangePasswordSuccess("Password changed successfully!")
                          setCurrentPassword("")
                          setNewPassword("")
                        } catch (error) {
                          setChangePasswordError(error instanceof Error ? error.message : String(error))
                        } finally {
                          setChangePasswordLoading(false)
                        }
                      }}
                      disabled={changePasswordLoading || !currentPassword || !newPassword}
                    >
                      {changePasswordLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </Card>
      </main>
    </div>
  )
}