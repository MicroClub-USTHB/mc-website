import { guardDomAgainstTranslation } from "@/lib/translate-dom-guard"

// Runs before the app becomes interactive, so React never touches the DOM unguarded.
guardDomAgainstTranslation()
