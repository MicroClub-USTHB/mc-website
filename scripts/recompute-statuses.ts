/**
 * Recomputes the stored status of every registration from its timeline, after a change to the
 * rule in `registrationStatus`. Safe to run again: it only writes the statuses that differ.
 *
 *   pnpm db:recompute-statuses
 */
import { connectToDatabase } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"
import { registrationStatus, type TimelineEntry } from "@/lib/registrations/timeline"

import { run } from "./run"

run(async () => {
  await connectToDatabase()
  const registrations = await RegistrationModel.find().select("status timeline").lean()
  const changes = registrations.flatMap((registration) => {
    const status = registrationStatus((registration.timeline ?? []) as TimelineEntry[])
    return status === registration.status
      ? []
      : [{ updateOne: { filter: { _id: registration._id }, update: { $set: { status } } } }]
  })
  if (changes.length > 0) await RegistrationModel.bulkWrite(changes)
  console.info(`Checked ${registrations.length} registrations, updated ${changes.length}.`)
})
