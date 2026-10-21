"use client"

import { usePathname } from "next/navigation"

import { isBarePage } from "@/config/site"

/** Renders its children (footer, chatbot...) except on bare pages; they stay Server Components. */
export function BarePageGate({ children }: { children: React.ReactNode }) {
  return isBarePage(usePathname()) ? null : children
}
