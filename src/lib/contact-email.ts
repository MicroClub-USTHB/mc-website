import { siteConfig } from "@/config/site"
import type { ContactValues } from "@/lib/contact-validation"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/** Email layout shared by both messages: a card with a title, an intro and the submitted fields. */
function renderCard({
  title,
  intro,
  values,
}: {
  title: string
  intro: string
  values: ContactValues
}) {
  const row = (label: string, content: string) => `
    <tr>
      <td style="padding:12px 0;border-top:1px solid #e6e9ff">
        <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#54588b">${label}</div>
        <div style="margin-top:4px;font-size:16px;line-height:24px;color:#000350">${content}</div>
      </td>
    </tr>`

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f9faff;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e9ff;border-radius:12px;padding:24px">
      <tr><td>
        <h1 style="margin:0 0 8px;font-size:22px;line-height:30px;color:#0006b1">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:20px;color:#54588b">${escapeHtml(intro)}</p>
      </td></tr>
      ${row("Full name", escapeHtml(values.name))}
      ${row("Email", `<a href="mailto:${escapeHtml(values.email)}" style="color:#0006b1">${escapeHtml(values.email)}</a>`)}
      ${row("Message", escapeHtml(values.message).replaceAll("\n", "<br>"))}
    </table>
    <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#54588b">${siteConfig.name} · ${siteConfig.url}</p>
  </body>
</html>`
}

function renderText(intro: string, values: ContactValues) {
  return `${intro}\n\nFull name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}\n`
}

/** Email received by the club inbox. Replying answers the sender. */
export function buildClubEmail(values: ContactValues) {
  const intro = `New message from the ${siteConfig.name} website contact form.`
  return {
    subject: `New contact message from ${values.name.replace(/[\r\n]+/g, " ")}`,
    html: renderCard({ title: "New contact message", intro, values }),
    text: renderText(intro, values),
  }
}

/** Confirmation sent to the person who filled the form, with a copy of what they submitted. */
export function buildConfirmationEmail(values: ContactValues) {
  const intro =
    "Thank you for contacting us! We received your message and our team will reach out as soon as possible. Here is a copy of what you sent."
  return {
    subject: `We received your message – ${siteConfig.name}`,
    html: renderCard({ title: "Your message has been sent", intro, values }),
    text: renderText(intro, values),
  }
}
