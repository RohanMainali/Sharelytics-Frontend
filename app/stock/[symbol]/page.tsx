import { StockDetail } from "@/components/stock-detail"
import { Header } from "@/components/header"

interface StockPageProps {
  params: {
    symbol: string
  }
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = await params

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <Header />
      <div className="container mx-auto py-12 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <StockDetail symbol={symbol} />
          </div>
        </div>
      </div>
    </div>
  )
}
