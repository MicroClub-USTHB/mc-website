/** Message of a failed `authClient` call: rate limits get their own, the rest Better Auth's. */
export function authErrorMessage(
  error: { status: number; message?: string | undefined },
  fallback: string,
) {
  if (error.status === 429) return "Too many attempts. Wait a few minutes and try again."
  return error.message || fallback
}
