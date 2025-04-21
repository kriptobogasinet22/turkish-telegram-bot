import { Bot, InlineKeyboard } from "grammy"
import { fetchCryptoPrice } from "./crypto-api"
import { saveTransaction } from "./db"

// Types
type ConversionType = "TRY_TO_CRYPTO" | "CRYPTO_TO_TRY"
type CryptoSymbol = "BTC" | "USDT" | "DOGE" | "TRX"

interface ConversionRequest {
  type: ConversionType
  cryptoSymbol: CryptoSymbol
  amount: number
  userId: number
  username: string
}

// Initialize the bot with your token
export function initBot(token: string) {
  const bot = new Bot(token)

  // Start command handler
  bot.command("start", async (ctx) => {
    await ctx.reply("Merhaba! TRY ve kripto para birimlerini dönüştürmek için beni kullanabilirsiniz.", {
      reply_markup: getMainKeyboard(),
    })
  })

  // Help command handler
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Bu bot TRY ve kripto para birimlerini dönüştürmenize yardımcı olur.\n\n" +
        "Özel sohbette butonları kullanabilir veya doğrudan miktar yazabilirsiniz.\n" +
        "Örnek: 100 TRY to BTC\n\n" +
        "Grup sohbetlerinde komut olarak kullanabilirsiniz.\n" +
        "Örnek: 100 try to doge",
    )
  })

  // Handle button clicks
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data

    if (data === "main_menu") {
      await ctx.editMessageText("Lütfen bir dönüşüm seçin:", { reply_markup: getMainKeyboard() })
      return
    }

    // Handle conversion selection
    if (data.includes("_TO_")) {
      const [from, to] = data.split("_TO_")

      await ctx.editMessageText(`${from} miktarını ${to}'ye dönüştürmek için miktar girin:`, {
        reply_markup: getBackKeyboard(),
      })

      // Set conversation state
      // This would need to be stored in a database in a real implementation
      // For simplicity, we're using a mock approach here
      return
    }
  })

  // Handle text messages (for amount input and direct conversion commands)
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text

    // Check if it's a direct conversion command (e.g., "100 try to btc")
    const conversionRegex = /(\d+(?:\.\d+)?)\s*(try|trx|btc|usdt|doge)\s*to\s*(try|trx|btc|usdt|doge)/i
    const match = text.match(conversionRegex)

    if (match) {
      const amount = Number.parseFloat(match[1])
      const fromCurrency = match[2].toUpperCase()
      const toCurrency = match[3].toUpperCase()

      await handleConversion(
        {
          type: fromCurrency === "TRY" ? "TRY_TO_CRYPTO" : "CRYPTO_TO_TRY",
          cryptoSymbol: (fromCurrency === "TRY" ? toCurrency : fromCurrency) as CryptoSymbol,
          amount,
          userId: ctx.from.id,
          username: ctx.from.username || `user_${ctx.from.id}`,
        },
        ctx,
      )

      return
    }

    // Otherwise, check if it's just a number (responding to a previous conversion selection)
    if (/^\d+(\.\d+)?$/.test(text)) {
      // In a real implementation, you would retrieve the conversation state
      // For now, we'll just show a message
      await ctx.reply("Lütfen önce dönüşüm tipini seçin.", { reply_markup: getMainKeyboard() })
    }
  })

  return bot
}

// Helper function to handle conversions
async function handleConversion(request: ConversionRequest, ctx: any) {
  try {
    const { type, cryptoSymbol, amount, userId, username } = request

    // Get current price
    const price = await fetchCryptoPrice(cryptoSymbol)

    let result: number
    let fromAmount: string
    let toAmount: string

    if (type === "TRY_TO_CRYPTO") {
      result = amount / price
      fromAmount = `${amount} TRY`
      toAmount = `${result.toFixed(8)} ${cryptoSymbol}`
    } else {
      result = amount * price
      fromAmount = `${amount} ${cryptoSymbol}`
      toAmount = `${result.toFixed(2)} TRY`
    }

    // Save transaction to database
    await saveTransaction({
      userId,
      username,
      type: type === "TRY_TO_CRYPTO" ? `TRY TO ${cryptoSymbol}` : `${cryptoSymbol} TO TRY`,
      amount: fromAmount,
      result: toAmount,
      date: new Date().toISOString(),
    })

    // Send result to user
    await ctx.reply(
      `💱 Dönüşüm Sonucu:\n\n${fromAmount} = ${toAmount}\n\nGüncel kur: 1 ${cryptoSymbol} = ${price.toFixed(2)} TRY`,
      { reply_markup: getMainKeyboard() },
    )
  } catch (error) {
    console.error("Conversion error:", error)
    await ctx.reply("Dönüşüm sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
  }
}

// Helper function to get main keyboard
function getMainKeyboard() {
  return new InlineKeyboard()
    .row()
    .text("TRX TO TRY", "TRX_TO_TRY")
    .text("TRY TO TRX", "TRY_TO_TRX")
    .row()
    .text("USDT TO TRY", "USDT_TO_TRY")
    .text("TRY TO USDT", "TRY_TO_USDT")
    .row()
    .text("DOGE TO TRY", "DOGE_TO_TRY")
    .text("TRY TO DOGE", "TRY_TO_DOGE")
    .row()
    .text("BTC TO TRY", "BTC_TO_TRY")
    .text("TRY TO BTC", "TRY_TO_BTC")
}

// Helper function to get back keyboard
function getBackKeyboard() {
  return new InlineKeyboard().text("« Ana Menü", "main_menu")
}
