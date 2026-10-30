import "server-only"

import { randomInt } from "node:crypto"

/** Letters and digits without the look-alikes (0/O, 1/l/I), so an emailed password is easy to type. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

/** Random password for a new or reset account, about 117 bits of entropy. */
export function generatePassword(length = 20) {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")
}
