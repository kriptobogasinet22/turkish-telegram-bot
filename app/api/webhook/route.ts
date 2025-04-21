import { type NextRequest, NextResponse } from "next/server"
import { initBot } from "@/lib/telegram-bot"

// Initialize the bot
const bot = initBot(process.env.TELEGRAM_BOT_TOKEN || "")

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()

    // Process the update with the bot
    await bot.handleUpdate(body)

    // Return a success response
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram bot webhook is active" })
}
