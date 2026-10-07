import { useId } from "react"

import {
  GradientStops,
  sectionIconClassName,
  Shadowed,
  type SectionIconProps,
} from "@/components/club-sections/svg-effects"

const BLOB =
  "M73.6808 20.2129C76.0046 20.1753 78.2295 19.2376 79.8773 17.5987C91.0997 6.43631 104.306 0 118.44 0C132.572 0 145.776 6.43443 156.997 17.5936C158.7 19.287 161.017 20.2308 163.418 20.2067C179.667 20.0439 193.937 24.8194 204.144 35.0266C214.135 45.0176 218.922 58.9015 218.968 74.7238C218.974 77.0867 219.915 79.3576 221.581 81.0333C232.736 92.2533 239.168 105.455 239.168 119.584C239.168 133.713 232.736 146.915 221.581 158.135C219.915 159.811 218.974 162.082 218.968 164.445C218.923 180.268 214.136 194.153 204.144 204.144C193.937 214.352 179.666 219.127 163.416 218.964C161.014 218.94 158.698 219.883 156.995 221.577C145.774 232.735 132.571 239.168 118.44 239.168C104.307 239.168 91.1015 232.733 79.8795 221.572C78.2317 219.933 76.0068 218.995 73.6831 218.958C58.2929 218.709 44.7981 213.916 35.0266 204.144C25.0355 194.153 20.2485 180.269 20.2031 164.447C20.1963 162.084 19.2555 159.813 17.5894 158.137C6.4328 146.917 0 133.714 0 119.584C0 105.454 6.43278 92.2516 17.5894 81.0311C19.2555 79.3555 20.1962 77.0846 20.203 74.7216C20.2489 58.9002 25.0359 45.0172 35.0266 35.0266C44.7976 25.2556 58.2915 20.4619 73.6808 20.2129Z"

const SLASH = {
  x: 130.674,
  y: 77.8164,
  width: 10.0049,
  height: 88.4132,
  rx: 3.59099,
  transform: "rotate(22.4034 130.674 77.8164)",
}
const RIGHT_BRACKET =
  "M145.219 95.774C143.452 97.9887 143.815 101.217 146.03 102.983L165.443 118.471C166.472 119.292 166.472 120.857 165.443 121.679L146.088 137.12C143.874 138.887 143.511 142.114 145.278 144.329L145.578 144.706C147.343 146.918 150.566 147.283 152.781 145.522L164.079 136.537L176.059 126.79L179.656 123.384C179.786 123.261 179.906 123.129 180.016 122.988L180.986 121.747C182.153 120.256 181.96 118.115 180.547 116.855L179.851 116.235L176.059 113.209L152.724 94.5926C150.509 92.8257 147.282 93.1887 145.515 95.4034L145.219 95.774Z"
const LEFT_BRACKET =
  "M91.8116 95.774C93.5785 97.9887 93.2155 101.217 91.0008 102.983L71.5882 118.471C70.5585 119.292 70.5585 120.857 71.5882 121.679L90.9424 137.12C93.1571 138.887 93.5202 142.114 91.7532 144.329L91.4526 144.706C89.6877 146.918 86.4645 147.283 84.2494 145.522L72.9519 136.537L60.9718 126.79L57.3743 123.384C57.2447 123.261 57.1244 123.129 57.0145 122.988L56.0444 121.747C54.8782 120.256 55.0704 118.115 56.4836 116.855L57.1797 116.235L60.9718 113.209L84.3065 94.5926C86.5213 92.8257 89.7491 93.1887 91.516 95.4034L91.8116 95.774Z"

// Both states share the same stop offsets. Extra stops sit where
// the other state's gradient ends (the hovered gradients have a smaller radius).
const states = {
  normal: {
    darkBase: 0,
    blobOpacity: 1,
    base: [
      { offset: 0, color: "var(--baby-blue-800)", opacity: 1 },
      { offset: 0.2313, color: "var(--baby-blue-800)", opacity: 1 },
      { offset: 0.6403, color: "#888ADB", opacity: 1 },
      { offset: 1, color: "var(--neutral-white)", opacity: 1 },
    ],
    glass: [
      { offset: 0, color: "var(--baby-blue-800)", opacity: 1 },
      { offset: 0.468, color: "#3D42C4", opacity: 0.8083 },
      { offset: 0.8929, color: "#7578D5", opacity: 0.6343 },
      { offset: 1, color: "var(--neutral-white)", opacity: 0.2 },
    ],
    glassShadows: [0.6, 0.86, 0, 0],
    symbol: { color: "#D5D6FF", opacity: 1 },
    symbolShadow: { color: "#AAACFF", opacity: 0.5 },
  },
  active: {
    darkBase: 1,
    blobOpacity: 0.65,
    base: [
      { offset: 0, color: "var(--neutral-black)", opacity: 0 },
      { offset: 0.2313, color: "#005C2C", opacity: 0.3612 },
      { offset: 0.6403, color: "#00FF7B", opacity: 1 },
      { offset: 1, color: "#00FF7B", opacity: 1 },
    ],
    glass: [
      { offset: 0, color: "var(--neutral-black)", opacity: 0 },
      { offset: 0.468, color: "#00FF7B", opacity: 1 },
      { offset: 0.8929, color: "#00FF7B", opacity: 1 },
      { offset: 1, color: "#00FF7B", opacity: 1 },
    ],
    glassShadows: [0, 0, 0.6, 0.86],
    symbol: { color: "var(--neutral-white)", opacity: 0.74 },
    symbolShadow: { color: "var(--flashy-green-300)", opacity: 0.58 },
  },
}

/** IT / Dev section illustration (code brackets on a glass blob). */
export function DevSectionIcon({ active = false, className, ...props }: SectionIconProps) {
  const id = useId()
  const s = active ? states.active : states.normal
  const white = "var(--neutral-white)"
  const symbolFill = { fill: s.symbol.color, fillOpacity: s.symbol.opacity }
  const symbolGlow = { blur: 4.98981, color: white, opacity: 0.5 }
  const symbol = [
    <rect key="slash" {...SLASH} style={symbolFill} />,
    <path key="right" d={RIGHT_BRACKET} style={symbolFill} />,
    <path key="left" d={LEFT_BRACKET} style={symbolFill} />,
  ]

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden
      className={sectionIconClassName(className)}
      {...props}
    >
      <Shadowed
        id={`${id}-base-fx`}
        region={{ x: 0, y: 0, width: 239.168, height: 239.168 }}
        inner={[
          { blur: 14.8765, color: white, opacity: 0.6 },
          { blur: 2.86086, color: white, opacity: 0.86 },
        ]}
      >
        <path d={BLOB} style={{ fill: "var(--neutral-black)", opacity: s.darkBase }} />
        <path d={BLOB} fill={`url(#${id}-base)`} style={{ fillOpacity: s.blobOpacity }} />
      </Shadowed>
      {/* The hovered glass has tighter inner shadows: each state keeps its own set. */}
      <Shadowed
        id={`${id}-glass-fx`}
        region={{ x: -3.34456, y: -3.34456, width: 245.857, height: 245.857 }}
        inner={[
          { blur: 26.0458, color: white, opacity: s.glassShadows[0] },
          { blur: 18.6041, color: white, opacity: s.glassShadows[1] },
          { blur: 14.8765, color: white, opacity: s.glassShadows[2] },
          { blur: 2.86086, color: white, opacity: s.glassShadows[3] },
        ]}
      >
        <path d={BLOB} fill={`url(#${id}-glass)`} style={{ fillOpacity: s.blobOpacity }} />
      </Shadowed>
      <Shadowed
        id={`${id}-symbol-fx`}
        region={{ x: 55.2822, y: 78.9131, width: 126.466, height: 87.4333 }}
        inner={[{ dy: 4.07331, blur: 7.99388, ...s.symbolShadow }]}
        outline={symbol}
      >
        <Shadowed
          id={`${id}-slash-fx`}
          region={{ x: 98.0745, y: 78.9131, width: 40.7529, height: 83.36 }}
          inner={[symbolGlow]}
        >
          {symbol[0]}
        </Shadowed>
        <Shadowed
          id={`${id}-right-fx`}
          region={{ x: 144.099, y: 93.4725, width: 37.6494, height: 53.1643 }}
          inner={[symbolGlow]}
        >
          {symbol[1]}
        </Shadowed>
        <Shadowed
          id={`${id}-left-fx`}
          region={{ x: 55.2822, y: 93.4725, width: 37.6494, height: 53.1643 }}
          inner={[symbolGlow]}
        >
          {symbol[2]}
        </Shadowed>
      </Shadowed>
      <defs>
        <radialGradient
          id={`${id}-base`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(119.584 119.584) rotate(90.6463) scale(186.751)"
        >
          <GradientStops stops={s.base} />
        </radialGradient>
        <radialGradient
          id={`${id}-glass`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(119.584 119.584) rotate(87.6593) scale(255.516)"
        >
          <GradientStops stops={s.glass} />
        </radialGradient>
      </defs>
    </svg>
  )
}
