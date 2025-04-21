// Crypto types
export type CryptoSymbol = "BTC" | "USDT" | "DOGE" | "TRX"
export type ConversionType = "TRY_TO_CRYPTO" | "CRYPTO_TO_TRY"

// User types
export interface User {
  id: number
  username: string
  firstName?: string
  lastName?: string
  joinDate: string
}

// Transaction types
export interface Transaction {
  id?: string
  userId: number
  username: string
  type: string
  amount: string
  result: string
  date: string
}

// Conversion request
export interface ConversionRequest {
  type: ConversionType
  cryptoSymbol: CryptoSymbol
  amount: number
  userId: number
  username: string
}
