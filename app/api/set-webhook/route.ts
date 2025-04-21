import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!token || !webhookUrl) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 400 });
    }

    // Set the webhook URL
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}/api/webhook`, {
      method: "GET",
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error setting webhook:", error);
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 });
  }
}
