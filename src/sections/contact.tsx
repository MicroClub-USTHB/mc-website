import { ContactForm } from "@/components/contact/contact-form"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"
import { CONTACT } from "@/const/contact"

/** schema.org Organization contact point: the club email, address and this contact form. */
const CONTACT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  email: CONTACT.email,
  address: { "@type": "PostalAddress", ...CONTACT.address },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "general inquiries",
    email: CONTACT.email,
    url: `${siteConfig.url}/#contact`,
    availableLanguage: ["en", "fr", "ar"],
  },
}

/**
 * Contact Us (Figma): intro on the left, message form on the right (440px / 589px on the 1280px
 * content width). Stacks on tablet and mobile; the intro sits on the form's bottom edge on desktop.
 */
export function Contact() {
  return (
    <SectionContainer id="contact" aria-labelledby="contact-title" bleed>
      <JsonLd data={CONTACT_JSON_LD} />
      <div className="mx-auto flex max-w-site flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-20 lg:py-21.25">
        <div className="flex w-full flex-col gap-7 lg:w-110">
          <h2
            id="contact-title"
            className="header-md font-normal text-primary uppercase sm:header-lg lg:header-xl"
          >
            {CONTACT.title}
          </h2>
          <p className="pl-2 paragraph-md font-medium text-muted-foreground">
            {CONTACT.intro[0]}
            <br />
            {CONTACT.intro[1]}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:w-147.25 lg:pt-6.25 lg:pb-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="header-sm font-medium text-foreground">{CONTACT.form.title}</h3>
            <p className="paragraph-sm font-medium text-muted-foreground">
              {CONTACT.form.instructions}
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </SectionContainer>
  )
}
