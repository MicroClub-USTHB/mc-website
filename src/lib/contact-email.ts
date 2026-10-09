import { siteConfig } from "@/config/site"
import { EMAIL_LOGO_BASE64 } from "@/lib/email-logo"
import type { ContactValues } from "@/lib/contact-validation"

/** mcoli-ui light tokens (src/app/globals.css) as hex: emails cannot use CSS variables. */
const COLOR = {
  background: "#f9faff",
  card: "#ffffff",
  border: "#e6e9ff",
  primary: "#0006b1",
  primaryForeground: "#ffffff",
  foreground: "#000350",
  muted: "#54588b",
} as const

const HEADING_FONT = "'Plus Jakarta Sans','DM Sans',Arial,Helvetica,sans-serif"
const BODY_FONT = "'DM Sans',Arial,Helvetica,sans-serif"

/** Content id the logo is attached with, referenced as `cid:` in the HTML. */
const LOGO_CID = "mc-logo"

const LOGO_ATTACHMENT = {
  filename: "mc-logo.png",
  content: EMAIL_LOGO_BASE64,
  contentType: "image/png",
  contentId: LOGO_CID,
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function field(label: string, content: string) {
  return `
        <tr><td style="padding:0 32px 16px">
          <div style="font-family:${BODY_FONT};font-size:14px;line-height:20px;font-weight:500;color:${COLOR.muted};padding-bottom:6px">${label}</div>
          <div style="font-family:${BODY_FONT};font-size:16px;line-height:24px;color:${COLOR.foreground};background:${COLOR.background};border:1px solid ${COLOR.border};border-radius:8px;padding:10px 14px">${content}</div>
        </td></tr>`
}

function button(label: string, href: string) {
  return `
        <tr><td style="padding:8px 32px 32px">
          <a href="${escapeHtml(href)}" style="display:block;font-family:${BODY_FONT};font-size:16px;line-height:24px;font-weight:500;text-align:center;text-decoration:none;color:${COLOR.primaryForeground};background:${COLOR.primary};border-radius:8px;padding:10px 18px">${label}</a>
        </td></tr>`
}

/** Email layout shared by both messages: branded header, title, intro, submitted fields, footer. */
function renderEmail({
  preheader,
  title,
  intro,
  values,
  action,
}: {
  preheader: string
  title: string
  intro: string
  values: ContactValues
  action?: { label: string; href: string }
}) {
  const email = escapeHtml(values.email)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLOR.background}">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.background}">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:12px;overflow:hidden">
        <tr><td align="center" style="background:${COLOR.primary};padding:28px 32px">
          <img src="cid:${LOGO_CID}" width="88" height="62" alt="${siteConfig.name}" style="display:block;border:0;width:88px;height:auto">
        </td></tr>
        <tr><td style="padding:32px 32px 8px">
          <h1 style="margin:0;font-family:${HEADING_FONT};font-size:28px;line-height:36px;font-weight:600;color:${COLOR.foreground}">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px">
          <p style="margin:0;font-family:${BODY_FONT};font-size:16px;line-height:24px;color:${COLOR.muted}">${escapeHtml(intro)}</p>
        </td></tr>
        ${field("Full name", escapeHtml(values.name))}
        ${field("Email", `<a href="mailto:${email}" style="color:${COLOR.primary};text-decoration:none">${email}</a>`)}
        ${field("Message", escapeHtml(values.message).replaceAll("\n", "<br>"))}
        ${action ? button(escapeHtml(action.label), action.href) : `<tr><td style="padding-bottom:16px"></td></tr>`}
        </table>
        <p style="margin:20px 0 0;font-family:${BODY_FONT};font-size:12px;line-height:18px;color:${COLOR.muted};text-align:center">
          ${siteConfig.name} · <a href="${siteConfig.url}" style="color:${COLOR.muted}">${siteConfig.url.replace("https://", "")}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

function renderText(intro: string, values: ContactValues) {
  return `${intro}\n\nFull name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}\n\n${siteConfig.name} - ${siteConfig.url}\n`
}

/** Email received by the club inbox. Replying answers the sender. */
export function buildClubEmail(values: ContactValues) {
  const intro = `New message from the ${siteConfig.name} website contact form.`
  const subject = `New contact message from ${values.name.replace(/[\r\n]+/g, " ")}`
  return {
    subject,
    html: renderEmail({
      preheader: `${values.name}: ${values.message.slice(0, 90)}`,
      title: "New contact message",
      intro,
      values,
      action: {
        label: `Reply to ${values.name}`,
        href: `mailto:${values.email}?subject=${encodeURIComponent("Re: your message to MicroClub")}`,
      },
    }),
    text: renderText(intro, values),
    attachments: [LOGO_ATTACHMENT],
  }
}

/** Confirmation sent to the person who filled the form, with a copy of what they submitted. */
export function buildConfirmationEmail(values: ContactValues) {
  const intro =
    "Thank you for contacting us! We received your message and our team will reach out as soon as possible. Here is a copy of what you sent."
  return {
    subject: `We received your message - ${siteConfig.name}`,
    html: renderEmail({
      preheader: "We received your message and will reach out as soon as possible.",
      title: "Your message has been sent",
      intro,
      values,
      action: { label: "Visit our website", href: siteConfig.url },
    }),
    text: renderText(intro, values),
    attachments: [LOGO_ATTACHMENT],
  }
}
