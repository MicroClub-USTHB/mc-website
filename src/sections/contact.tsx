import { ContactForm } from "@/components/contact/contact-form"
import { SectionContainer } from "@/components/shared/section-container"

/**
 * Contact Us (Figma): intro on the left, message form on the right (440px / 589px on the 1280px
 * content width). Stacks on tablet and mobile; the intro sits on the form's bottom edge on desktop.
 */
export function Contact() {
  return (
    <SectionContainer id="contact" aria-labelledby="contact-title" bleed>
      <div className="mx-auto flex max-w-site flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-20 lg:py-21.25">
        <div className="flex w-full flex-col gap-7 lg:w-110">
          <h2
            id="contact-title"
            className="header-xl text-[2.75rem] leading-tight font-normal text-primary uppercase sm:text-6xl lg:text-[72px] lg:leading-[90px]"
          >
            Have a question or an idea ?
          </h2>
          <p className="pl-2 paragraph-md font-medium text-muted-foreground">
            Contact us!
            <br />
            We’d love to hear from you! Share a few details, and our team will reach out as soon as
            possible.
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:w-147.25 lg:pt-6.25 lg:pb-9.25">
          <div className="flex flex-col gap-1.5">
            <h3 className="header-sm font-medium text-foreground">Send Message</h3>
            <p className="paragraph-sm font-medium text-muted-foreground">
              Please fill out the form below with your details and your message
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </SectionContainer>
  )
}
