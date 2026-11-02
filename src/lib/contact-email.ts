import { siteConfig } from "@/config/site"
import { emailField, emailLink, escapeHtml, renderEmail } from "@/lib/email"
import type { ContactValues } from "@/lib/contact-validation"

/** The submitted fields, shown in both messages. */
function contactRows(values: ContactValues) {
  const email = escapeHtml(values.email)
  return [
    emailField("Full name", escapeHtml(values.name)),
    emailField("Email", emailLink(email, `mailto:${values.email}`)),
    emailField("Message", escapeHtml(values.message).replaceAll("\n", "<br>")),
  ].join("")
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
      rows: contactRows(values),
      action: {
        label: `Reply to ${values.name}`,
        href: `mailto:${values.email}?subject=${encodeURIComponent("Re: your message to Micro Club")}`,
      },
    }),
    text: renderText(intro, values),
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
      rows: contactRows(values),
      action: { label: "Visit our website", href: siteConfig.url },
    }),
    text: renderText(intro, values),
  }
}
