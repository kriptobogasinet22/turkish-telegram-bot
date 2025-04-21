import { createClient } from "@supabase/supabase-js"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Supabase istemcisini oluştur
const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Telegram Bot Token
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || ""

// Para birimi dönüşümü için yardımcı fonksiyon
async function convertCurrency(fromCurrency: string, toCurrency: string, amount: number) {
  // Dönüşüm oranlarını veritabanından al
  const { data: rates, error } = await supabase.from("rates").select("currency, try_rate")

  if (error) {
    console.error("Dönüşüm oranları alınamadı:", error)
    return null
  }

  // Oranları bir nesneye dönüştür
  const rateMap = rates.reduce((acc, rate) => {
    acc[rate.currency] = rate.try_rate
    return acc
  }, {})

  // TRY'ye dönüştür, sonra hedef para birimine dönüştür
  if (fromCurrency === "TRY") {
    return amount / rateMap[toCurrency]
  } else if (toCurrency === "TRY") {
    return amount * rateMap[fromCurrency]
  } else {
    // Önce TRY'ye dönüştür, sonra hedef para birimine
    const tryAmount = amount * rateMap[fromCurrency]
    return tryAmount / rateMap[toCurrency]
  }
}

// Kullanıcıyı veritabanına kaydet
async function saveUser(user) {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      telegram_id: user.id,
      username: user.username || null,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
    })
    .select()

  if (error) {
    console.error("Kullanıcı kaydedilemedi:", error)
  }

  return data
}

// İşlemi veritabanına kaydet
async function saveTransaction(userId, fromCurrency, toCurrency, fromAmount, toAmount, chatType) {
  const { data, error } = await supabase.from("transactions").insert({
    user_id: userId,
    from_currency: fromCurrency,
    to_currency: toCurrency,
    from_amount: fromAmount,
    to_amount: toAmount,
    chat_type: chatType,
  })

  if (error) {
    console.error("İşlem kaydedilemedi:", error)
  }

  return data
}

// Mesaj işleme
async function handleMessage(message) {
  const chatId = message.chat.id
  const chatType = message.chat.type
  const user = message.from

  // Kullanıcıyı kaydet
  await saveUser(user)

  // Özel mesaj ise
  if (chatType === "private") {
    if (message.text === "/start") {
      return {
        method: "sendMessage",
        chat_id: chatId,
        text: "Merhaba! TRY ve kripto para birimleri arasında dönüşüm yapmak için aşağıdaki butonları kullanabilirsiniz.",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "TRX TO TRY", callback_data: "convert_TRX_TRY" },
              { text: "TRY TO TRX", callback_data: "convert_TRY_TRX" },
            ],
            [
              { text: "USDT TO TRY", callback_data: "convert_USDT_TRY" },
              { text: "TRY TO USDT", callback_data: "convert_TRY_USDT" },
            ],
            [
              { text: "DOGE TO TRY", callback_data: "convert_DOGE_TRY" },
              { text: "TRY TO DOGE", callback_data: "convert_TRY_DOGE" },
            ],
            [
              { text: "BTC TO TRY", callback_data: "convert_BTC_TRY" },
              { text: "TRY TO BTC", callback_data: "convert_TRY_BTC" },
            ],
          ],
        },
      }
    }

    // Doğrudan dönüşüm mesajı ise (örn: "100 TRY to BTC")
    const conversionRegex = /(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/i
    const match = message.text.match(conversionRegex)

    if (match) {
      const amount = Number.parseFloat(match[1])
      const fromCurrency = match[2].toUpperCase()
      const toCurrency = match[3].toUpperCase()

      const result = await convertCurrency(fromCurrency, toCurrency, amount)

      if (result !== null) {
        // İşlemi kaydet
        await saveTransaction(user.id, fromCurrency, toCurrency, amount, result, chatType)

        return {
          method: "sendMessage",
          chat_id: chatId,
          text: `${amount} ${fromCurrency} = ${result.toFixed(8)} ${toCurrency}`,
        }
      } else {
        return {
          method: "sendMessage",
          chat_id: chatId,
          text: "Dönüşüm yapılamadı. Lütfen geçerli para birimleri kullanın.",
        }
      }
    }
  }
  // Grup mesajı ise
  else if (chatType === "group" || chatType === "supergroup") {
    const conversionRegex = /(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/i
    const match = message.text.match(conversionRegex)

    if (match) {
      const amount = Number.parseFloat(match[1])
      const fromCurrency = match[2].toUpperCase()
      const toCurrency = match[3].toUpperCase()

      const result = await convertCurrency(fromCurrency, toCurrency, amount)

      if (result !== null) {
        // İşlemi kaydet
        await saveTransaction(user.id, fromCurrency, toCurrency, amount, result, chatType)

        return {
          method: "sendMessage",
          chat_id: chatId,
          text: `${amount} ${fromCurrency} = ${result.toFixed(8)} ${toCurrency}`,
          reply_to_message_id: message.message_id,
        }
      }
    }
  }

  return null
}

// Callback sorgusu işleme
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id
  const user = callbackQuery.from
  const data = callbackQuery.data

  // Kullanıcıyı kaydet
  await saveUser(user)

  if (data.startsWith("convert_")) {
    const [_, fromCurrency, toCurrency] = data.split("_")

    return {
      method: "sendMessage",
      chat_id: chatId,
      text: `Lütfen dönüştürmek istediğiniz ${fromCurrency} miktarını girin. Örnek: 100 ${fromCurrency} to ${toCurrency}`,
    }
  }

  return null
}

// Ana işlev
serve(async (req) => {
  try {
    const update = await req.json()
    console.log("Gelen güncelleme:", JSON.stringify(update))

    let response = null

    // Mesaj işleme
    if (update.message) {
      response = await handleMessage(update.message)
    }
    // Callback sorgusu işleme
    else if (update.callback_query) {
      response = await handleCallbackQuery(update.callback_query)
    }

    if (response) {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${response.method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      })

      const responseData = await telegramResponse.json()
      console.log("Telegram yanıtı:", JSON.stringify(responseData))
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Hata:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
