import Image from "next/image"

import { MicroBotFace } from "@/components/microbot/microbot-face"
import { cn } from "@/lib/utils"
import robot from "@/assets/microbot/robot.webp"

type MicroBotLauncherProps = React.ComponentProps<"button">

/**
 * 73×73 button showing Micro Bot (Figma "MicroBot": the robot image, with its screen animated by
 * `MicroBotFace`): opens and closes the chat panel.
 */
export function MicroBotLauncher({ className, ...props }: MicroBotLauncherProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative size-[73px] shrink-0 cursor-pointer rounded-[1.125rem] transition-transform duration-300 ease-out-quart outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-secondary motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
      {...props}
    >
      <Image
        src={robot}
        alt=""
        sizes="73px"
        priority
        draggable={false}
        className="absolute inset-0 size-full max-w-none object-cover"
      />
      <MicroBotFace />
    </button>
  )
}
