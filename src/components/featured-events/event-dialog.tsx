"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useLenis } from "lenis/react"

import { EventCard } from "@/components/featured-events/event-card"
import { XIcon } from "@/components/icons/x"
import { McButton } from "@/components/ui/mc-button"
import type { FeaturedEvent } from "@/const/featured-events"

const OpenEventContext = createContext<(id: string) => void>(() => {})
const EventDialogOpenContext = createContext(false)

/** Opens the card of an event, by id. */
export function useOpenEvent() {
  return useContext(OpenEventContext)
}

/** Whether an event card is open (the chain pauses meanwhile). */
export function useEventDialogOpen() {
  return useContext(EventDialogOpenContext)
}

/**
 * Event card dialog of the Events Hub: any child can open an event's `EventCard` with
 * `useOpenEvent()` (the chain does it when a slice is clicked). The card opens in a modal Base UI
 * dialog (focus trap, Escape and outside click close it, focus returns on close) floating over the
 * section, as in Figma, and Lenis is stopped meanwhile so the page behind does not scroll.
 */
export function EventDialogProvider({
  events,
  children,
}: {
  events: FeaturedEvent[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Kept after closing so the card stays rendered during the exit transition.
  const [selectedId, setSelectedId] = useState<string>()
  const selected = events.find((event) => event.id === selectedId)
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    return () => lenis?.start()
  }, [open, lenis])

  // Stable opener, so consumers do not re-render when the dialog state changes.
  const [openEvent] = useState(() => (id: string) => {
    setSelectedId(id)
    setOpen(true)
  })

  return (
    <OpenEventContext value={openEvent}>
      <EventDialogOpenContext value={open}>
        {children}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            {/*
              Figma: the section stays visible behind the card, only toned down by the dark
              background at 50% (no blur). `dark`: the portal sits outside the dark section.
            */}
            <Dialog.Backdrop className="dark fixed inset-0 z-60 bg-background/50 transition-opacity duration-300 ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Viewport
              data-lenis-prevent
              className="dark fixed inset-0 z-60 flex overflow-y-auto p-0 sm:p-6 lg:p-8"
            >
              {/* Not in Figma: only shown to keyboard users (Escape or a click outside also close). */}
              <Dialog.Close
                render={
                  <McButton
                    variant="secondary"
                    icon="only"
                    iconDefinition={<XIcon />}
                    className="fixed top-4 right-4 z-10 opacity-0 focus-visible:opacity-100 pointer-coarse:opacity-100"
                  />
                }
              >
                Close
              </Dialog.Close>
              {selected && (
                <Dialog.Popup
                  render={<EventCard event={selected} />}
                  className="transition duration-300 ease-out-quart max-sm:mb-0 max-sm:data-ending-style:translate-y-full max-sm:data-starting-style:translate-y-full sm:data-ending-style:scale-95 sm:data-ending-style:opacity-0 sm:data-starting-style:scale-95 sm:data-starting-style:opacity-0"
                />
              )}
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      </EventDialogOpenContext>
    </OpenEventContext>
  )
}
