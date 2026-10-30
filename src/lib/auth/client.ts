import { createAuthClient } from "better-auth/client"

/**
 * Browser client of `/api/auth`, for the calls that must go through HTTP to be rate limited:
 * sign in, sign out, forgot and reset password. Account management goes through Server Actions.
 */
export const authClient = createAuthClient()
