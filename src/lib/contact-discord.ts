import { siteConfig } from "@/config/site"
import type { ContactValues } from "@/lib/contact-validation"

/** Posts the submission to a Discord channel webhook as an embed. Throws when Discord refuses it. */
export async function notifyDiscord(webhookUrl: string, values: ContactValues) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: `${siteConfig.name} Website`,
      // Never ping anyone because of what a visitor typed.
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: "New contact message",
          color: 0x0006b1,
          fields: [
            { name: "Full name", value: values.name.slice(0, 1024) },
            { name: "Email", value: values.email.slice(0, 1024) },
          ],
          description: values.message.slice(0, 4000),
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
  if (!response.ok) throw new Error(`Discord responded with ${response.status}`)
}
