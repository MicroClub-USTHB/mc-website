import { HeartHandshakeIcon, LinkIcon, UserRoundIcon, type LucideIcon } from "lucide-react"

export type RegistrationStep = {
  /** "STEP n" label is derived from the position. */
  name: string
  icon: LucideIcon
}

/** Registration form steps (Figma "Step Navigation"), in display order. */
export const REGISTRATION_STEPS: RegistrationStep[] = [
  { name: "Personal Informations", icon: UserRoundIcon },
  { name: "About You & The Club", icon: HeartHandshakeIcon },
  { name: "Additional Information", icon: LinkIcon },
]

export type PhoneCountry = {
  /** Short code shown in the dropdown (Figma shows "ALG"). */
  code: string
  name: string
  dialCode: string
}

/** Phone prefixes, Algeria first (default). */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "ALG", name: "Algeria", dialCode: "+213" },
  { code: "TUN", name: "Tunisia", dialCode: "+216" },
  { code: "MAR", name: "Morocco", dialCode: "+212" },
  { code: "LBY", name: "Libya", dialCode: "+218" },
  { code: "EGY", name: "Egypt", dialCode: "+20" },
  { code: "SAU", name: "Saudi Arabia", dialCode: "+966" },
  { code: "ARE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "QAT", name: "Qatar", dialCode: "+974" },
  { code: "TUR", name: "Turkey", dialCode: "+90" },
  { code: "FRA", name: "France", dialCode: "+33" },
  { code: "ESP", name: "Spain", dialCode: "+34" },
  { code: "ITA", name: "Italy", dialCode: "+39" },
  { code: "DEU", name: "Germany", dialCode: "+49" },
  { code: "GBR", name: "United Kingdom", dialCode: "+44" },
  { code: "CAN", name: "Canada", dialCode: "+1" },
  { code: "USA", name: "United States", dialCode: "+1" },
]

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0].code

/** Skills the applicant can pick from (step 3). */
export const REGISTRATION_SKILLS = [
  "Web development",
  "Mobile development",
  "AI & machine learning",
  "Data science",
  "Cybersecurity",
  "DevOps & cloud",
  "UI / UX design",
  "Graphic design",
  "Video editing & motion",
  "Photography",
  "Game development",
  "3D modeling",
  "Electronics & embedded",
  "Robotics",
  "Content writing",
  "Social media & marketing",
  "Public speaking",
  "Event organization",
  "Project management",
  "Teamwork & leadership",
] as const

/** Student ID upload rules (Figma "CLICK TO UPLOAD STUDENT ID"). */
export const STUDENT_ID_RULES = {
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  accept: "image/jpeg,image/png,image/webp,application/pdf",
  label: "JPG, PNG, WebP or PDF, 5 MB max",
} as const

/** Longest answer accepted by each "About You & The Club" question. */
export const ANSWER_MAX_LENGTH = 1000
export const ANSWER_MIN_LENGTH = 10

/** Questions of step 2 (Figma labels, kept as designed), keyed by their form field. */
export const ABOUT_QUESTIONS = [
  { field: "aboutYou", label: "Describe yourself shortly" },
  { field: "knowAboutClub", label: "What do you know about the Club ?" },
  { field: "beingInClub", label: "What do you think being part of a student Club involves ?" },
  { field: "canBring", label: "What do you think you can bring to the Club ?" },
  {
    field: "yearGoals",
    label: "What do you hope to achieve by the end of this year in Micro Club ?",
  },
  { field: "expectations", label: "What do you expect from Micro Club ?" },
] as const

/** Optional profile links of step 3 (Figma labels), keyed by their form field. */
export const PROFILE_LINKS = [
  { field: "portfolioUrl", label: "Portfolio link" },
  { field: "behanceUrl", label: "Behance link" },
  { field: "linkedinUrl", label: "LinkedIn link" },
  { field: "githubUrl", label: "Github link" },
] as const
