import type { CryptoSymbol } from "./types"

// Function to fetch crypto prices from an API
export async function fetchCryptoPrice(symbol: CryptoSymbol): Promise<number> {
  try {
    // In a real implementation, you would use a real API like CoinGecko or Binance
    // For demonstration purposes, we'll use mock data
    const mockPrices: Record<string, number> = {
      BTC: 1000000, // 1 BTC = 1,000,000 TRY
      USDT: 31.5, // 1 USDT = 31.5 TRY
      DOGE: 1.5, // 1 DOGE = 1.5 TRY
      TRX: 2.35, // 1 TRX = 2.35 TRY
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return mockPrices[symbol] || 0
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    throw new Error("Failed to fetch crypto price")
  }
}

// Function to get historical prices (for charts)
export async function getHistoricalPrices(symbol: CryptoSymbol, days = 7): Promise<any[]> {
  try {
    // In a real implementation, you would fetch historical data from an API
    // For demonstration purposes, we'll generate mock data
    const mockData = []
    const currentPrice = await fetchCryptoPrice(symbol)
    const now = Date.now()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      // Generate a random price fluctuation within ±5%
      const randomFactor = 0.95 + Math.random() * 0.1
      const price = currentPrice * randomFactor

      mockData.push({
        date: date.toISOString().split("T")[0],
        price: price.toFixed(2),
      })
    }

    return mockData
  } catch (error) {
    console.error("Error fetching historical prices:", error)
    throw new Error("Failed to fetch historical prices")
  }
}
