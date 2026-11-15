/**
 * Deletes one registration (e.g. a double), its student ID file and the HR places pointing to it.
 * Without --yes it only shows which registration it would delete.
 *
 *   pnpm db:delete-registration --id 6aef7515a7c24188d90a2ff9          # shows it
 *   pnpm db:delete-registration --id 6aef7515a7c24188d90a2ff9 --yes    # deletes it
 */
import { parseArgs } from "node:util"

import { v2 as cloudinary } from "cloudinary"
import { ObjectId } from "mongodb"
import { isValidObjectId } from "mongoose"

// The raw collections, not the app's model: it pulls in the form's icons, which a script cannot load.
import { getMongoClient } from "@/lib/mongodb"

import { run } from "./run"

run(async () => {
  const { values } = parseArgs({
    options: { id: { type: "string" }, yes: { type: "boolean", default: false } },
  })
  const id = values.id ?? ""
  if (!isValidObjectId(id)) throw new Error("Usage: pnpm db:delete-registration --id <id> [--yes]")

  const db = getMongoClient().db()
  const registrations = db.collection<{
    firstName: string
    lastName: string
    email: string
    status: string
    createdAt: Date
    studentId?: { publicId: string; resourceType: string }
  }>("registrations")
  const registration = await registrations.findOne({ _id: new ObjectId(id) })
  if (!registration) throw new Error(`No registration has the id ${id}.`)

  const others = await registrations.countDocuments({
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

  await registrations.deleteOne({ _id: registration._id })
  const places = await db.collection("review_places").deleteMany({ registrationId: id })
  console.info(`Deleted the registration and ${places.deletedCount} HR place(s) pointing to it.`)

  if (registration.studentId?.publicId) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      await cloudinary.uploader.destroy(registration.studentId.publicId, {
        type: "authenticated",
        resource_type: registration.studentId.resourceType,
      })
      console.info("Deleted its student ID file from Cloudinary.")
    } catch (error) {
      console.warn("Its student ID file could not be deleted from Cloudinary:", error)
    }
  }
})
