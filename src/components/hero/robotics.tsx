"use client"

import { useEffect, useId, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import { AnimatePresence, motion } from "motion/react"

import { EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"
import printedPaper from "@/assets/hero/activities/printed-paper.webp"
import blueprint from "@/assets/hero/robotics/blueprint.webp"
import circuit from "@/assets/hero/robotics/circuit.webp"
import closeIcon from "@/assets/hero/robotics/close.svg"
import cuttingMat from "@/assets/hero/robotics/cutting-mat.webp"
import drone from "@/assets/hero/robotics/drone.webp"
import droneOutline from "@/assets/hero/robotics/drone-outline.svg"
import electronics from "@/assets/hero/robotics/electronics.webp"
import sketch from "@/assets/hero/robotics/sketch.webp"
import warningIcon from "@/assets/hero/robotics/warning.svg"
import workbench from "@/assets/hero/robotics/workbench.webp"

/** A Figma layer placed by its own top-left corner, then rotated (and flipped) around it. */
type Layer = {
  x: number
  y: number
  width: number
  height: number
  rotate?: number
  flipY?: boolean
}

/**
 * CSS transform of a Figma layer: rotation, then a vertical flip in its own axes. CSS functions,
 * not a `matrix()` computed here: `Math.cos` may differ in the last digit between Node and the
 * browser, and the style would not match on hydration.
 */
function layerStyle({ x, y, width, height, rotate = 0, flipY }: Layer): React.CSSProperties {
  return {
    left: x,
    top: y,
    width,
    height,
    transformOrigin: "0 0",
    transform: flipY
      ? `rotate(${rotate}deg) scaleY(-1)`
      : rotate
        ? `rotate(${rotate}deg)`
        : undefined,
  }
}

/** Figma "Printed Photo": white paper with a hairline border and a soft shadow. */
function Print(layer: Layer) {
  return (
    <div
      aria-hidden
      className="absolute overflow-hidden border-[1.177px] border-border bg-background shadow-[0_4.205px_22.424px_0_rgb(0_0_0/0.05)]"
      style={layerStyle(layer)}
    >
      <Image
        src={printedPaper}
        alt=""
        sizes="470px"
        loading="eager"
        className="size-full max-w-none object-cover"
      />
    </div>
  )
}

function Photo({ src, alt, ...layer }: Layer & { src: StaticImageData; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={`${Math.ceil(Math.max(layer.width, layer.height))}px`}
      draggable={false}
      className="absolute max-w-none"
      style={layerStyle(layer)}
    />
  )
}

/**
 * Drone sticker: Figma "Default" variant, placed in its bounding box (tilt included). The "Hover"
 * and "Clicked" variants are 215.622px wide instead of 201.324px and, as laid out in the Figma
 * component set, grow from the bottom-left corner of that box and rise by 7px.
 */
const DRONE_BOX = { left: 141.641, top: 204.78, width: 242.48, height: 265.38 }
const DRONE = { x: 0, y: 39.337, width: 201.324, height: 230.485, rotate: -11.25 }
const DRONE_ZOOM = 215.622 / 201.324
const DRONE_RISE = -7

/**
 * Figma "Robotic Working Space": three printed photos of the robotics workshop (electronics, a
 * cutting mat with a circuit board and a blueprint) under a drone sticker. Hovering the drone
 * lifts it (it grows, with a white edge); clicking it opens a "Local is closed / robots are
 * under construction" pop up, closed with its cross, Escape or another click on the drone.
 */
export function Robotics() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  const lifted = open || hovered

  return (
    <div className="relative h-[484px] w-[685.381px] select-none">
      {/* Static photos: no interaction, so a press on them still pans the canvas. */}
      <div className="pointer-events-none absolute inset-0">
        <Print x={0} y={30.104} width={356.107} height={216.797} rotate={-4.85} />
        <Photo
          src={workbench}
          alt="An Arduino board and a LED matrix on a workbench"
          x={357.908}
          y={206.887}
          width={193.687}
          height={328.838}
          rotate={-94.41}
          flipY
        />

        <Print x={325.678} y={29.996} width={356.107} height={216.797} rotate={15.85} />
        <Photo
          src={electronics}
          alt="Wires, sensors and parts spread on the robotics workbench"
          x={599.222}
          y={320.852}
          width={193.687}
          height={328.838}
          rotate={-74.21}
          flipY
        />

        <Print x={102.386} y={162.989} width={467.85} height={284.888} />
        <div className="absolute top-[181.583px] left-[115.93px] h-[247.928px] w-[440.762px] overflow-hidden">
          <div
            className="absolute border-[0.23px] border-background"
            style={layerStyle({ x: 440.761, y: 0, width: 247.928, height: 440.762, rotate: 90 })}
          >
            <Image
              src={cuttingMat}
              alt="A blue cutting mat with a ruler"
              sizes="250px"
              draggable={false}
              className="size-full max-w-none object-cover"
            />
          </div>
          <Photo
            src={circuit}
            alt="An Arduino board wired to an ultrasonic sensor"
            x={196.047}
            y={7.46}
            width={199.841}
            height={270.988}
            rotate={-42.71}
          />
        </div>

        <div
          className="absolute bg-blueprint-paper shadow-[0_2.44px_3.538px_0_rgb(0_0_0/0.25)]"
          style={layerStyle({
            x: 410.026,
            y: 326.357,
            width: 138.633,
            height: 113.339,
            rotate: 22.42,
          })}
        >
          <Image
            src={blueprint}
            alt=""
            sizes="140px"
            className="size-full max-w-none object-cover opacity-40"
          />
        </div>
        <Photo
          src={sketch}
          alt="A technical drawing of a drone"
          x={408.756}
          y={337.458}
          width={133.536}
          height={90.418}
          rotate={23.11}
        />
      </div>

      {/* The drone sticker. */}
      <motion.div
        className="absolute"
        style={{ ...DRONE_BOX, transformOrigin: "0% 100%" }}
        animate={lifted ? { scale: DRONE_ZOOM, y: DRONE_RISE } : { scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
      >
        <div className="absolute" style={layerStyle(DRONE)}>
          <motion.button
            type="button"
            aria-label="Robotics workspace: see its status"
            aria-expanded={open}
            aria-controls={titleId}
            onClick={() => setOpen((value) => !value)}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="group/drone relative block size-full cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-secondary"
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-[-4.821px] left-[-0.918px] h-[233.927px] w-[202.781px] mask-contain mask-no-repeat transition-colors duration-300",
                open ? "bg-blue-primary-300" : lifted ? "bg-background" : "bg-sticker-edge",
              )}
              style={{ maskImage: `url(${droneOutline.src})` }}
            />
            <Image
              src={drone}
              alt="A white drone"
              sizes="202px"
              draggable={false}
              className="absolute top-0 left-0 h-[230.593px] w-[201.324px] max-w-none"
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Pop up, over the photos. */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
            className="absolute top-[133px] left-[167px] flex w-[329px] flex-col items-end gap-2.5"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="size-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Image src={closeIcon} alt="" unoptimized draggable={false} className="size-4" />
            </button>
            <div className="flex w-full flex-col items-center gap-[18px] border border-border bg-destructive pb-6">
              <p
                id={titleId}
                className="flex w-full items-center justify-center gap-1 bg-background py-1 text-lg leading-7 font-bold text-destructive"
              >
                <Image src={warningIcon} alt="" unoptimized draggable={false} className="size-5" />
                LOCAL IS CLOSED
              </p>
              <p className="w-[288px] text-center font-heading text-2xl leading-8 font-bold whitespace-nowrap text-destructive-foreground">
                ROBOTS ARE
                <br />
                UNDER-CONSTRUCTION
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
