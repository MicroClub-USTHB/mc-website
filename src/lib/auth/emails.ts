import "server-only"

import { adminRoutes } from "@/config/admin"
import { siteConfig } from "@/config/site"
import { emailField, emailParagraph, escapeHtml, renderEmail, sendEmail } from "@/lib/email"

type AuthEmail = { subject: string; html: string; text: string }

/** Origin links in auth emails point to: the deployed site, or `BETTER_AUTH_URL` locally. */
function appUrl(path: string) {
  return new URL(path, process.env.BETTER_AUTH_URL ?? siteConfig.url).toString()
}

/**
 * Sends an auth email from `AUTH_FROM_EMAIL` (see `.env.example`). Replies are not read, so the
 * emails point to the club president instead.
 */
export async function sendAuthEmail(to: string, email: AuthEmail) {
  const from = process.env.AUTH_FROM_EMAIL
  if (!from) throw new Error("AUTH_FROM_EMAIL is missing")
  await sendEmail({ from, to, ...email })
}

/** Sign-in details of a new account, or of an account whose password the president reset. */
export function credentialsEmail({
  name,
  email,
  password,
  reset,
}: {
  name: string
  email: string
  password: string
  /** The president reset the password of an existing account. */
  reset: boolean
}): AuthEmail {
  const signInUrl = appUrl(adminRoutes.signIn)
  const intro = reset
    ? `Hi ${name}, the club president reset your ${siteConfig.name} admin password. Here is your new one.`
    : `Hi ${name}, an account was created for you on the ${siteConfig.name} admin area. Here are your sign-in details.`
  const notice = "You will be asked to choose your own password when you sign in."
  return {
    subject: reset
      ? `Your new ${siteConfig.name} admin password`
      : `Your ${siteConfig.name} admin account`,
    html: renderEmail({
      preheader: notice,
      title: reset ? "Your password was reset" : "Welcome to the admin area",
      intro,
      rows: [
        emailField("Email", escapeHtml(email)),
        emailField(
          "Password",
          `<span style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;letter-spacing:1px">${escapeHtml(password)}</span>`,
        ),
        emailParagraph(notice),
      ].join(""),
      action: { label: "Sign in", href: signInUrl },
    }),
    text: `${intro}\n\nEmail: ${email}\nPassword: ${password}\n\n${notice}\nSign in: ${signInUrl}\n`,
  }
}

/** Link to choose a new password, sent from "Forgot password?". */
export function resetPasswordEmail({ name, url }: { name: string; url: string }): AuthEmail {
  const intro = `Hi ${name}, we received a request to reset your ${siteConfig.name} admin password.`
  const notice =
    "This link expires in 1 hour. If you did not ask for it, you can ignore this email: your password stays the same."
  return {
    subject: `Reset your ${siteConfig.name} admin password`,
    html: renderEmail({
      preheader: "Choose a new password for your admin account.",
      title: "Reset your password",
      intro,
      rows: emailParagraph(notice),
      action: { label: "Choose a new password", href: url },
    }),
    text: `${intro}\n\nChoose a new password: ${url}\n\n${notice}\n`,
  }
}

/** Notice after the user changed or reset their password, to warn them if it was not them. */
export function passwordChangedEmail({ name }: { name: string }): AuthEmail {
  const intro = `Hi ${name}, the password of your ${siteConfig.name} admin account was just changed.`
  const notice = "If this was not you, contact the club president right away."
  return {
    subject: `Your ${siteConfig.name} admin password was changed`,
    html: renderEmail({
      preheader: notice,
      title: "Your password was changed",
      intro,
      rows: emailParagraph(notice),
    }),
    text: `${intro}\n\n${notice}\n`,
  }
}
