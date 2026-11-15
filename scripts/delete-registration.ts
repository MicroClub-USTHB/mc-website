/**
 * Deletes one registration (e.g. a double), its student ID file and the HR places pointing to it.
 * Without --yes it only shows which registration it would delete.
 *
 *   pnpm db:delete-registration --id 6aef7515a7c24188d90a2ff9          # shows it
 *   pnpm db:delete-registration --id 6aef7515a7c24188d90a2ff9 --yes    # deletes it
 */
import { parseArgs } from "node:util"

import { isValidObjectId } from "mongoose"

import { deleteStudentId } from "@/lib/cloudinary"
import { connectToDatabase, getMongoClient } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"

import { run } from "./run"

run(async () => {
  const { values } = parseArgs({
    options: { id: { type: "string" }, yes: { type: "boolean", default: false } },
  })
  const id = values.id ?? ""
  if (!isValidObjectId(id)) throw new Error("Usage: pnpm db:delete-registration --id <id> [--yes]")

  await connectToDatabase()
  const registration = await RegistrationModel.findById(id)
    .select("firstName lastName email status createdAt studentId")
    .lean()
  if (!registration) throw new Error(`No registration has the id ${id}.`)

  const others = await RegistrationModel.countDocuments({
    email: registration.email,
    _id: { $ne: registration._id },
  })
  console.info(
    `${registration.firstName} ${registration.lastName} <${registration.email}>, ${registration.status}, submitted ${new Date(registration.createdAt).toISOString()}.`,
  )
  console.info(`Other registrations with this email: ${others}.`)
  if (!values.yes) {
    console.info("Nothing deleted. Run again with --yes to delete it.")
    return
  }

  await RegistrationModel.deleteOne({ _id: registration._id })
  const places = await getMongoClient()
    .db()
    .collection("review_places")
    .deleteMany({ registrationId: id })
  console.info(`Deleted the registration and ${places.deletedCount} HR place(s) pointing to it.`)

  if (registration.studentId?.publicId) {
    try {
      await deleteStudentId(registration.studentId)
      console.info("Deleted its student ID file from Cloudinary.")
    } catch (error) {
      console.warn("Its student ID file could not be deleted from Cloudinary:", error)
    }
  }
})
