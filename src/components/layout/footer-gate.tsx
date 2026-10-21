"use client"

import { usePathname } from "next/navigation"

import { isBarePage } from "@/config/site"

/** Renders the footer (passed as children, so it stays a Server Component) except on bare pages. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  return isBarePage(usePathname()) ? null : children
}
