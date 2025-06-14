"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SectorNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SectorNavigation({ activeTab, onTabChange }: SectorNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sectors = [
    { id: "all", name: "All Stocks" },
    { id: "commercial-banks", name: "Commercial Banks" },
    { id: "development-banks", name: "Development Banks" },
    { id: "finance", name: "Finance" },
    { id: "life-insurance", name: "Life Insurance" },
    { id: "non-life-insurance", name: "Non Life Insurance" },
    { id: "hydropower", name: "Hydropower" },
    { id: "manufacturing", name: "Manufacturing" },
    { id: "microfinance", name: "Microfinance" },
    { id: "investment", name: "Investment" },
    { id: "hotel", name: "Hotel & Tourism" },
    { id: "trading", name: "Trading" },
    { id: "details", name: "Stock Details" },
  ]

  // For mobile view
  const handleSelect = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile dropdown */}
      <div className="md:hidden w-full mb-4">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {sectors.find((s) => s.id === activeTab)?.name || "Select Sector"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {sectors.map((sector) => (
              <DropdownMenuItem key={sector.id} onClick={() => handleSelect(sector.id)}>
                {sector.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:block mb-4 border-b border-blue-100">
        <div className="tabs-container">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="tabs-list bg-transparent h-auto">
              {sectors.map((sector) => (
                <TabsTrigger
                  key={sector.id}
                  value={sector.id}
                  className="data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none px-4 py-2 text-gray-700"
                >
                  {sector.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </>
  )
}
