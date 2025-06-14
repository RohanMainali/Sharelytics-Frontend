"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  lastUpdated: Date | null
}

export function RefreshButton({ onRefresh, lastUpdated }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh Data
      </Button>
      {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
    </div>
  )
}
