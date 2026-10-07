import { useId } from "react"

import {
  GradientStops,
  sectionIconClassName,
  Shadowed,
  type SectionIconProps,
  type Shadow,
} from "@/components/club-sections/svg-effects"

const HEAD =
  "M263.629 73.4648C290.983 73.4648 313.158 95.64 313.158 122.994V193.378C313.158 220.732 290.983 242.908 263.629 242.908H142.17C114.816 242.908 92.6405 220.732 92.6404 193.378V122.994C92.6406 95.6402 114.816 73.4652 142.17 73.4648H186.21V38.1328C181.943 34.1215 179.265 28.3514 179.265 21.9375C179.265 9.82198 188.815 0.000191895 200.595 0C212.376 3.81652e-05 221.926 9.82189 221.927 21.9375C221.926 28.8354 218.829 34.9883 213.989 39.0098V73.4648H263.629ZM149.55 106.049C133.002 106.049 119.587 119.464 119.587 136.012V177.752C119.587 194.3 133.002 207.715 149.55 207.715H256.913C273.461 207.715 286.876 194.3 286.876 177.752V136.012C286.876 119.464 273.461 106.049 256.913 106.049H149.55Z"

/** The head's outer contour, without the screen window. */
const HEAD_OUTLINE = `${HEAD.split("ZM")[0]}Z`

const EARS = [
  {
    d: "M56.3071 174.81C56.3071 189.394 68.1298 201.217 82.7138 201.217C83.8357 201.217 84.7451 200.307 84.7451 199.186L84.7451 116.749C84.7451 115.627 83.8357 114.718 82.7138 114.718C68.1298 114.718 56.3071 126.541 56.3071 141.125L56.3071 174.81Z",
    filterX: 0,
  },
  {
    d: "M347.797 141.125C347.797 126.541 335.974 114.719 321.39 114.719C320.269 114.719 319.359 115.628 319.359 116.75V199.186C319.359 200.308 320.269 201.218 321.39 201.218C335.974 201.218 347.797 189.395 347.797 174.811V141.125Z",
    filterX: 263.052,
  },
]

const EYES = [
  { cx: 168.537, filterX: 94.456, innerFilterX: 150.763 },
  { cx: 237.262, filterX: 163.181, innerFilterX: 219.488 },
]

const HIGHLIGHTS = [
  {
    d: "M94.0821 117.225C96.8472 122.051 111.096 107.478 129.603 96.8752C148.11 86.2726 168.985 84.8206 166.22 79.994C163.455 75.1675 138.096 68.7941 119.589 79.3967C101.082 89.9993 91.317 112.398 94.0821 117.225Z",
    region: { x: 74.6605, y: 54.678, width: 110.766, height: 82.4569, blur: 9.47932 },
  },
  {
    d: "M94.4212 199.971C97.1863 195.144 111.435 209.718 129.942 220.32C148.449 230.923 169.324 232.375 166.559 237.202C163.794 242.028 138.435 248.401 119.928 237.799C101.421 227.196 91.6561 204.797 94.4212 199.971Z",
    region: { x: 74.9996, y: 180.061, width: 110.766, height: 82.457, blur: 9.47932 },
  },
  {
    d: "M312.664 118.225C309.898 123.052 295.65 108.478 277.143 97.8757C258.636 87.2731 237.761 85.8211 240.526 80.9945C243.291 76.168 268.649 69.7946 287.156 80.3972C305.663 90.9998 315.429 113.399 312.664 118.225Z",
    region: { x: 221.319, y: 55.6784, width: 110.766, height: 82.457, blur: 9.47932 },
  },
  {
    d: "M313.003 198.971C310.238 194.145 295.989 208.718 277.482 219.321C258.975 229.923 238.1 231.375 240.865 236.202C243.63 241.028 268.989 247.402 287.496 236.799C306.003 226.197 315.768 203.798 313.003 198.971Z",
    region: { x: 221.659, y: 179.061, width: 110.766, height: 82.4569, blur: 9.47932 },
  },
  {
    d: "M329.905 115.632C324.752 115.824 330.634 135.226 331.427 156.54C332.22 177.855 324.474 196.991 329.627 196.799C334.781 196.608 350.883 177.16 350.09 155.846C349.297 134.532 335.059 115.44 329.905 115.632Z",
    region: { x: 314.066, y: 101.886, width: 49.7969, height: 108.66, blur: 6.87251 },
    /** Right ear glow: the only highlight that changes color. */
    changesColor: true,
  },
  {
    d: "M75.9029 120.395C80.4077 120.562 75.1738 139.989 74.3807 161.303C73.5876 182.617 80.2708 201.714 75.766 201.547C71.2612 201.379 57.2744 182.01 58.0675 160.696C58.8606 139.382 71.3982 120.227 75.9029 120.395Z",
    region: { x: 44.2901, y: 106.649, width: 47.1661, height: 108.644, blur: 6.87251 },
  },
]

const HIGHLIGHT = "#D9D9D9"

// Both states share the same stop offsets. The middle stop is
// where the hovered gradient ends (it has a smaller radius).
const states = {
  normal: {
    // The screen tilts and grows on hover.
    screen: "translate(107.377px, 96.4655px) rotate(-0.559498deg) scale(1)",
    // Not in the exported SVG: the Figma frames show a flat, vivid screen at rest.
    screenFill: [
      { offset: 0, color: "#1219C1" },
      { offset: 1, color: "#1C23CC" },
    ],
    screenOpacity: 1,
    ear: { color: "#3239FF", opacity: 0.7 },
    earShadow: [0.5, 0],
    pupil: "#9497FF",
    rim: [
      { offset: 0, color: "#BFC9FE" },
      { offset: 0.3627, color: "#7F88F0" },
      { offset: 1, color: "#0F16D7" },
    ],
    rimShadows: [0.5, 0.2],
    earGlow: { color: "var(--neutral-white)", opacity: 0.8 },
  },
  active: {
    screen: "translate(103.748px, 98.6485px) rotate(-5.01574deg) scale(1.07435)",
    screenFill: [
      { offset: 0, color: "#001C61" },
      { offset: 1, color: "#0039C7" },
    ],
    screenOpacity: 0.7,
    ear: { color: "#0072FF", opacity: 1 },
    earShadow: [0, 1],
    pupil: "#0073FF",
    rim: [
      { offset: 0, color: "#BFC9FE" },
      { offset: 0.3627, color: "#006CF0" },
      { offset: 1, color: "#006CF0" },
    ],
    rimShadows: [1, 1],
    earGlow: { color: HIGHLIGHT, opacity: 1 },
  },
}

/** Robotics section illustration (robot head). */
export function RoboticsSectionIcon({ active = false, className, ...props }: SectionIconProps) {
  const id = useId()
  const s = active ? states.active : states.normal
  const white = "var(--neutral-white)"
  const drop: Shadow = { blur: 28.1536, color: "#000450", opacity: 0.4 }

  return (
    <svg
      viewBox="0 0 405 263"
      fill="none"
      aria-hidden
      className={sectionIconClassName(className)}
      {...props}
    >
      {/*
        Figma blends the ears, eyes and highlights with the dark section behind the robot. The
        icon moves with CSS transforms, which isolate its blending, so it brings that backdrop
        along (in its own outline) and clips the blended layers to it.
      */}
      <g style={{ fill: "var(--background)" }}>
        <path d={HEAD_OUTLINE} />
        {EARS.map((ear) => (
          <path key={ear.filterX} d={ear.d} />
        ))}
      </g>
      <rect
        width="184.576"
        height="120.348"
        fill={`url(#${id}-screen)`}
        style={{ transform: s.screen, opacity: s.screenOpacity }}
      />
      {/* The hovered ears have a wider second inner shadow: each state keeps its own. */}
      {EARS.map((ear, index) => (
        <Shadowed
          key={ear.filterX}
          id={`${id}-ear-${index}-fx`}
          region={{ x: ear.filterX, y: 58.4109, width: 141.052, height: 199.113 }}
          drop={drop}
          inner={[
            { blur: 14.2071, color: white, opacity: 1 },
            { blur: 13.7265, color: white, opacity: s.earShadow[0] },
            { blur: 14.5153, color: white, opacity: s.earShadow[1] },
          ]}
          opacity="0.75"
          clipPath={`url(#${id}-outline)`}
          style={{ mixBlendMode: "hard-light" }}
        >
          <path d={ear.d} style={{ fill: s.ear.color, fillOpacity: s.ear.opacity }} />
        </Shadowed>
      ))}
      {EYES.map((eye, index) => (
        <Shadowed
          key={eye.cx}
          id={`${id}-eye-${index}-fx`}
          region={{ x: eye.filterX, y: 83.5139, width: 148.162, height: 149.347 }}
          drop={drop}
          inner={[
            { blur: 14.2071, color: white, opacity: 1 },
            { blur: 13.0341, color: white, opacity: 1 },
          ]}
          opacity="0.75"
          clipPath={`url(#${id}-outline)`}
          style={{ mixBlendMode: "hard-light" }}
        >
          <ellipse cx={eye.cx} cy="158.187" rx="17.7737" ry="18.3662" fill="#0073FF" />
        </Shadowed>
      ))}
      {EYES.map((eye, index) => (
        <Shadowed
          key={eye.cx}
          id={`${id}-pupil-${index}-fx`}
          region={{ x: eye.innerFilterX, y: 139.821, width: 35.5474, height: 36.7324 }}
          inner={[
            { blur: 14.2071, color: white, opacity: 1 },
            { blur: 13.0341, color: white, opacity: 1 },
          ]}
          clipPath={`url(#${id}-outline)`}
          style={{ mixBlendMode: "multiply" }}
        >
          <ellipse cx={eye.cx} cy="158.187" rx="17.7737" ry="18.3662" style={{ fill: s.pupil }} />
        </Shadowed>
      ))}
      <Shadowed
        id={`${id}-head-fx`}
        region={{ x: 92.6404, y: 0, width: 220.518, height: 242.908 }}
        inner={[
          { blur: 10.6642, color: white, opacity: 1 },
          { blur: 8.82762, color: white, opacity: 1 },
        ]}
        opacity="0.75"
      >
        <path d={HEAD} fill={`url(#${id}-head)`} />
      </Shadowed>
      <Shadowed
        id={`${id}-rim-fx`}
        region={{ x: 92.6404, y: 0, width: 220.518, height: 242.908 }}
        inner={[
          { blur: 10.6642, color: white, opacity: s.rimShadows[0] },
          { blur: 8.82762, color: white, opacity: s.rimShadows[1] },
        ]}
        opacity="0.75"
      >
        <path d={HEAD} fill={`url(#${id}-rim)`} />
      </Shadowed>
      {HIGHLIGHTS.map((highlight, index) => (
        <g
          key={highlight.d}
          filter={`url(#${id}-highlight-${index}-fx)`}
          clipPath={`url(#${id}-outline)`}
          style={{ mixBlendMode: "overlay" }}
        >
          <path
            d={highlight.d}
            style={
              highlight.changesColor
                ? { fill: s.earGlow.color, fillOpacity: s.earGlow.opacity }
                : { fill: HIGHLIGHT }
            }
          />
        </g>
      ))}
      <defs>
        <clipPath id={`${id}-outline`}>
          <path d={HEAD_OUTLINE} />
          {EARS.map((ear) => (
            <path key={ear.filterX} d={ear.d} />
          ))}
        </clipPath>
        {HIGHLIGHTS.map(({ d, region: { blur, ...region } }, index) => (
          <filter
            key={d}
            id={`${id}-highlight-${index}-fx`}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            {...region}
          >
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        ))}
        {/* Bounding box units so the gradient follows the screen's CSS transform. */}
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="0" y2="1">
          <GradientStops stops={s.screenFill} />
        </linearGradient>
        <radialGradient
          id={`${id}-head`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(202.323 151.669) rotate(90) scale(49.1741 44.6413)"
        >
          <stop stopColor="#BFC9FE" />
          <stop offset="1" stopColor="#006CF0" />
        </radialGradient>
        <radialGradient
          id={`${id}-rim`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(202.323 151.669) rotate(87.8404) scale(120.897 109.753)"
        >
          <GradientStops stops={s.rim} />
        </radialGradient>
      </defs>
    </svg>
  )
}
