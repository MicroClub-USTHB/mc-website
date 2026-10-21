"use client"

import { BirthDateField } from "@/components/registrations/birth-date-field"
import { PhoneField } from "@/components/registrations/phone-field"
import { RegistrationInput } from "@/components/registrations/registration-input"
import { StudentIdUpload } from "@/components/registrations/student-id-upload"

/** Step 1 (Figma "Personal Information Fields"): two columns, the ID upload fills the second one. */
export function StepPersonal() {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-10">
      <div className="flex flex-col gap-5">
        <RegistrationInput
          field="firstName"
          label="First name"
          placeholder="Enter your first name"
          autoComplete="given-name"
        />
        <RegistrationInput
          field="lastName"
          label="Last name"
          placeholder="Enter your last name"
          autoComplete="family-name"
        />
        <RegistrationInput
          field="discord"
          label="Discord username"
          placeholder="ex: _hanane4"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <PhoneField />
        <BirthDateField />
        <RegistrationInput
          field="email"
          type="email"
          inputMode="email"
          label="Email"
          placeholder="ex: example@gmail.com"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-5">
        <RegistrationInput
          field="fieldOfStudy"
          label="Field of study"
          placeholder="ex: computer science"
          autoComplete="off"
        />
        <RegistrationInput
          field="yearOfStudy"
          label="Year of study"
          placeholder="ex: 1st year"
          autoComplete="off"
        />
        <RegistrationInput
          field="university"
          label="University / School"
          placeholder="ex: USTHB"
          autoComplete="organization"
        />
        <StudentIdUpload />
      </div>
    </div>
  )
}
