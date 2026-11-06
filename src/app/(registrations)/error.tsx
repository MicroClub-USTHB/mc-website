"use client"

import { ErrorFallback } from "@/components/shared/error-fallback"

// Without it a crash in the form reaches `global-error.tsx`, which replaces the whole root layout.
export default ErrorFallback
