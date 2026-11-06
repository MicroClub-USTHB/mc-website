/** Shared by the seed scripts: they only ever write fake data to a local database. */
export function assertLocalDatabase() {
  const uri = process.env.MONGODB_URI ?? ""
  const host = /^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^:/?,]+)/.exec(uri)?.[1]
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Refusing to seed ${host ?? "an unknown database"}: only a local MONGODB_URI is allowed.`,
    )
  }
}
