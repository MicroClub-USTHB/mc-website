import "server-only"

import { Resend } from "resend"

import { siteConfig } from "@/config/site"
import { EMAIL_LOGO_BASE64 } from "@/lib/email-logo"

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

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/** A labeled value in a field box. `content` is HTML: escape user input before passing it. */
export function emailField(label: string, content: string) {
  return `
        <tr><td style="padding:0 32px 16px">
          <div style="font-family:${BODY_FONT};font-size:14px;line-height:20px;font-weight:500;color:${COLOR.muted};padding-bottom:6px">${label}</div>
          <div style="font-family:${BODY_FONT};font-size:16px;line-height:24px;color:${COLOR.foreground};background:${COLOR.background};border:1px solid ${COLOR.border};border-radius:8px;padding:10px 14px">${content}</div>
        </td></tr>`
}

/** A muted paragraph row. `content` is HTML: escape user input before passing it. */
export function emailParagraph(content: string) {
  return `
        <tr><td style="padding:0 32px 16px">
          <p style="margin:0;font-family:${BODY_FONT};font-size:14px;line-height:20px;color:${COLOR.muted}">${content}</p>
        </td></tr>`
}

export function emailLink(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="color:${COLOR.primary};text-decoration:none">${label}</a>`
}

function button(label: string, href: string) {
  return `
        <tr><td style="padding:8px 32px 32px">
          <a href="${escapeHtml(href)}" style="display:block;font-family:${BODY_FONT};font-size:16px;line-height:24px;font-weight:500;text-align:center;text-decoration:none;color:${COLOR.primaryForeground};background:${COLOR.primary};border-radius:8px;padding:10px 18px">${escapeHtml(label)}</a>
        </td></tr>`
}

/**
 * Branded email layout shared by every message: logo header, title, intro, `rows` (built with
 * `emailField` / `emailParagraph`), an optional button and the footer.
 */
export function renderEmail({
  preheader,
  title,
  intro,
  rows = "",
  action,
}: {
  preheader: string
  title: string
  intro: string
  rows?: string
  action?: { label: string; href: string }
}) {
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
        ${rows}
        ${action ? button(action.label, action.href) : `<tr><td style="padding-bottom:16px"></td></tr>`}
        </table>
        <p style="margin:20px 0 0;font-family:${BODY_FONT};font-size:12px;line-height:18px;color:${COLOR.muted};text-align:center">
          ${siteConfig.name} · <a href="${siteConfig.url}" style="color:${COLOR.muted}">${siteConfig.url.replace("https://", "")}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

export type EmailMessage = {
  from: string
  to: string
  replyTo?: string
  subject: string
  /** Built with `renderEmail`: the logo it references is attached here. */
  html: string
  text: string
}

/**
 * Sends an email through Resend (`RESEND_API_KEY`, see `.env.example`), throwing when it fails.
 * In development without a key, the email is printed to the server console instead, so flows that
 * send emails (contact form, admin accounts) can be tested without Resend.
 */
export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `\n--- Email (RESEND_API_KEY is not set, not sent) ---\nFrom: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n---\n`,
      )
      return
    }
    throw new Error("RESEND_API_KEY is missing")
  }

  const { error } = await new Resend(apiKey).emails.send({
    ...message,
    attachments: [LOGO_ATTACHMENT],
  })
  if (error) throw new Error(`${error.name}: ${error.message}`)
}
