import { type NextRequest, NextResponse } from "next/server"
import { getAllTransactions, getUserTransactions } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    let transactions

    if (userId) {
      transactions = await getUserTransactions(Number.parseInt(userId))
    } else {
      transactions = await getAllTransactions()
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
