"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import { clearReviewPlace, saveReviewPlace } from "@/lib/registrations/place-store"

const input = z.object({ id: z.string().min(1), search: z.string().max(2000) })

/** Marks the registration as the signed-in member's place, or clears it (`marked: false`). */
export async function markReviewPlace(id: string, search: string, marked: boolean) {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  const parsed = input.safeParse({ id, search })
  if (!parsed.success) return { status: "error" as const }
  try {
    if (marked) await saveReviewPlace(user.id, parsed.data.id, parsed.data.search, "mark")
    else await clearReviewPlace(user.id)
  } catch (error) {
    console.error("Review place: saving failed", error)
    return { status: "error" as const }
  }
  revalidatePath(adminRoutes.registrations, "layout")
  return { status: "success" as const }
}
