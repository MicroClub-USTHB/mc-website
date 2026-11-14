import { describe, expect, it } from "vitest"

import {
  DAILY_EMAIL_LIMIT,
  WAVE_SIZE,
  limitResetsAt,
  nextWaveSize,
  refusalsLocked,
} from "@/lib/registrations/decision-email-rules"

describe("nextWaveSize", () => {
  it("sends a full wave when there is room and work", () => {
    expect(nextWaveSize({ sentLast24h: 0, waiting: 1000 })).toBe(WAVE_SIZE)
  })
  it("stops at what waits", () => {
    expect(nextWaveSize({ sentLast24h: 0, waiting: 12 })).toBe(12)
  })
  it("stays within the daily limit", () => {
    expect(nextWaveSize({ sentLast24h: DAILY_EMAIL_LIMIT - 30, waiting: 1000 })).toBe(30)
    expect(nextWaveSize({ sentLast24h: DAILY_EMAIL_LIMIT, waiting: 1000 })).toBe(0)
    expect(nextWaveSize({ sentLast24h: DAILY_EMAIL_LIMIT + 5, waiting: 1000 })).toBe(0)
  })
})

describe("limitResetsAt", () => {
  const at = (hours: number) => new Date(Date.UTC(2026, 10, 14, hours))
  it("is null while there is room", () => {
    expect(limitResetsAt([at(1), at(2)])).toBeNull()
  })
  it("is 24 hours after the oldest email once the limit is reached", () => {
    const dates = Array.from({ length: DAILY_EMAIL_LIMIT }, (_, index) => at(2 + (index % 5)))
    expect(limitResetsAt(dates)).toEqual(new Date(Date.UTC(2026, 10, 15, 2)))
  })
})

describe("refusalsLocked", () => {
  it("locks refusals while an acceptance waits", () => {
    expect(refusalsLocked(1)).toBe(true)
    expect(refusalsLocked(0)).toBe(false)
  })
})
