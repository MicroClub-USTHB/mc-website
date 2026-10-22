import Image, { type StaticImageData } from "next/image"

import { cn } from "@/lib/utils"
import afterEffects from "@/assets/hero/playground/after-effects.svg"
import arduino from "@/assets/hero/playground/arduino.svg"
import binaryCode from "@/assets/hero/playground/binary-code.svg"
import blender from "@/assets/hero/playground/blender.svg"
import codeResult from "@/assets/hero/playground/code-result.svg"
import figma from "@/assets/hero/playground/figma.svg"
import flutter from "@/assets/hero/playground/flutter.svg"
import gamesResult from "@/assets/hero/playground/games-result.svg"
import gear from "@/assets/hero/playground/gear.svg"
import github from "@/assets/hero/playground/github.svg"
import githubMask from "@/assets/hero/playground/github-mask.svg"
import goal from "@/assets/hero/playground/goal.svg"
import illustrator from "@/assets/hero/playground/illustrator.svg"
import mario from "@/assets/hero/playground/mario.svg"
import megaphone from "@/assets/hero/playground/megaphone.svg"
import notion from "@/assets/hero/playground/notion.svg"
import photoshop from "@/assets/hero/playground/photoshop.svg"
import robot from "@/assets/hero/playground/robot.svg"
import skillsArrow from "@/assets/hero/playground/skills-arrow.svg"
import solidworks from "@/assets/hero/playground/solidworks.webp"
import toolsArrow from "@/assets/hero/playground/tools-arrow.svg"
import unity from "@/assets/hero/playground/unity.svg"
import vscodeBottom from "@/assets/hero/playground/vscode-bottom.svg"
import vscodeMask from "@/assets/hero/playground/vscode-mask.svg"
import vscodeShine from "@/assets/hero/playground/vscode-shine.svg"
import vscodeSide from "@/assets/hero/playground/vscode-side.svg"
import vscodeTop from "@/assets/hero/playground/vscode-top.svg"
import type { PlaygroundBodyId } from "@/const/playground"

/** A Figma vector, at its own size: fills its (absolutely placed) parent. */
function Vector({ src, className }: { src: StaticImageData; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      unoptimized
      draggable={false}
      className={cn("absolute block size-full max-w-none", className)}
    />
  )
}

/** Figma badge text: "if", the parentheses, labels. */
const TEXT = "font-sans text-[34.394px] leading-[50.953px] font-medium whitespace-nowrap"

/**
 * The `if ( icon )` of a badge: the closing parenthesis is the opening one flipped, as in Figma.
 * `icon` is placed on the parentheses' grid by its margins.
 */
function Condition({ color, icon }: { color: string; icon: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-end gap-[2.866px]">
      <p className={cn(TEXT, color)}>if</p>
      <div className="inline-grid shrink-0 grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0]">
        <p className={cn(TEXT, color, "col-1 row-1 mt-0 ml-0")}>(</p>
        <div className="col-1 row-1 mt-[1.43px] ml-[48.62px] flex items-center justify-center">
          <div className="flex-none -scale-y-100 rotate-180">
            <p className={cn(TEXT, color)}>(</p>
          </div>
        </div>
        {icon}
      </div>
    </div>
  )
}

/** An icon inside the parentheses of a `Condition`. */
function ConditionIcon({
  left,
  top,
  width,
  height = width,
  children,
}: {
  left: number
  top: number
  width: number
  height?: number
  children: React.ReactNode
}) {
  return (
    <div
      className="relative col-1 row-1 overflow-clip"
      style={{ marginLeft: left, marginTop: top, width, height }}
    >
      {children}
    </div>
  )
}

/** The arrow and what the condition gives, in the badges' second half. */
function Result({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("relative shrink-0", className)}>{children}</div>
}

const BADGE_CONTENT = "absolute flex items-center gap-[5.732px]"

/** Icon buttons: a 80px tile with the Figma border and shadow. */
const TILE = "absolute inset-0 border border-border shadow-[0_8px_16px_0_rgb(146_146_146/0.15)]"

/** A tool logo placed on its tile, in px from the tile's top left. */
function Logo({
  src,
  left,
  top,
  width,
  height,
}: {
  src: StaticImageData
  left: number
  top: number
  width: number
  height: number
}) {
  return (
    <div className="absolute" style={{ left, top, width, height }}>
      <Vector src={src} className="inset-0" />
    </div>
  )
}

/** A full-size illustrated button (its shadow included): 80px plus the shadow's margins. */
function Illustrated({ src }: { src: StaticImageData }) {
  return (
    <div className="absolute inset-[-10%_-20%_-30%_-20%]">
      <Vector src={src} className="inset-0" />
    </div>
  )
}

/** One layer of the VS Code mark: an image cut by the shared mask. */
function VscodeLayer({
  className,
  position,
  children,
}: {
  className: string
  position: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("absolute", className)}
      style={{
        maskImage: `url("${vscodeMask.src}")`,
        maskMode: "alpha",
        maskRepeat: "no-repeat",
        maskSize: "47px 46.758px",
        maskPosition: position,
      }}
    >
      {children}
    </div>
  )
}

/**
 * The pile of the playground, from the Figma "lwasmo" frame: tool logos on tiles and `if (…) →`
 * badges in the club's chart colors. Each view fills its body (the box the physics moves).
 * Decorative: hidden from assistive tech.
 */
export const PLAYGROUND_VIEWS: Record<PlaygroundBodyId, React.ReactNode> = {
  photoshop: <Illustrated src={photoshop} />,
  "after-effects": <Illustrated src={afterEffects} />,
  illustrator: <Illustrated src={illustrator} />,

  solidworks: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-background")} />
      <Image
        src={solidworks}
        alt=""
        sizes="66px"
        draggable={false}
        className="absolute top-2 left-1.5 size-[66px] max-w-none object-cover"
      />
    </>
  ),
  unity: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-[51px] bg-brand-slate")} />
      <Logo src={unity} left={16} top={13} width={48} height={54.162} />
    </>
  ),
  figma: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-[54px] bg-brand-black")} />
      <Logo src={figma} left={25.71} top={20} width={28.175} height={42.262} />
    </>
  ),
  vscode: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-background")} />
      <div className="absolute top-4 left-4 size-[47px] overflow-clip">
        <VscodeLayer className="inset-[0.26%_0_24.16%_-0.06%]" position="0.028px 0">
          <Vector src={vscodeTop} className="inset-0" />
        </VscodeLayer>
        <VscodeLayer className="inset-[24.16%_0_0.26%_-0.06%]" position="0.028px -11.235px">
          <div className="absolute inset-[-11.03%_-8.33%]">
            <Vector src={vscodeBottom} className="inset-0" />
          </div>
        </VscodeLayer>
        <VscodeLayer className="inset-[0.26%_0_0.26%_68.75%]" position="-32.313px 0">
          <div className="absolute inset-[-8.38%_-26.67%]">
            <Vector src={vscodeSide} className="inset-0" />
          </div>
        </VscodeLayer>
        <VscodeLayer
          className="inset-[0.26%_0.06%_0.26%_-0.06%] mix-blend-overlay"
          position="0.028px 0"
        >
          <Vector src={vscodeShine} className="inset-0" />
        </VscodeLayer>
      </div>
    </>
  ),
  notion: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-background")} />
      <Logo src={notion} left={17} top={20} width={45.851} height={48} />
    </>
  ),
  flutter: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-brand-slate")} />
      <Logo src={flutter} left={18.1} top={13.1} width={42.688} height={52.734} />
    </>
  ),
  arduino: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-brand-teal")} />
      <Logo src={arduino} left={13} top={26.9} width={53.161} height={25} />
    </>
  ),
  github: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-[67px] bg-background")} />
      <div className="absolute top-[13px] left-[13px] size-[53px] overflow-clip rounded-[67px]">
        <div
          className="absolute inset-[0_0_2.47%_0]"
          style={{
            maskImage: `url("${githubMask.src}")`,
            maskMode: "alpha",
            maskRepeat: "no-repeat",
            maskSize: "53px 53px",
          }}
        >
          <Vector src={github} className="inset-0" />
        </div>
      </div>
    </>
  ),
  blender: (
    <>
      <span aria-hidden className={cn(TILE, "rounded-lg bg-brand-slate")} />
      <div className="absolute top-px left-px size-[78px] overflow-clip">
        <div className="absolute inset-[16.02%_8.39%_16.23%_8.59%]">
          <Vector src={blender} className="inset-0" />
        </div>
      </div>
    </>
  ),

  games: (
    <>
      <span aria-hidden className="absolute inset-0 rounded-[37.546px] bg-chart-5" />
      <div className={cn(BADGE_CONTENT, "top-[7.51px] left-[16.69px]")}>
        <Condition
          color="text-background"
          icon={
            <ConditionIcon left={17.2} top={7.17} width={27.897} height={37.26}>
              <Vector src={mario} className="inset-0" />
            </ConditionIcon>
          }
        />
        <Result className="h-[37.26px] w-[68.787px]">
          <Vector src={gamesResult} className="inset-[0_0_0_-2.1%] size-auto" />
        </Result>
      </div>
    </>
  ),
  tools: (
    <>
      <span aria-hidden className="absolute inset-0 rounded-[6.675px] bg-accent" />
      <div className={cn(BADGE_CONTENT, "top-[7.17px] left-[10.03px]")}>
        <Condition
          color="text-accent-foreground"
          icon={
            <ConditionIcon left={11.3} top={7.85} width={37.262}>
              <Vector src={gear} className="inset-0" />
            </ConditionIcon>
          }
        />
        <div className="flex shrink-0 items-center gap-[8.598px]">
          <Result className="h-0 w-[22.929px]">
            <Vector src={toolsArrow} className="inset-[-10.63px_-6.29%] size-auto" />
          </Result>
          <Result className="size-[37.262px] overflow-clip">
            <div className="absolute inset-[0_0_6.25%_0]">
              <Vector src={robot} className="inset-0" />
            </div>
          </Result>
        </div>
      </div>
    </>
  ),
  event: (
    <>
      <span aria-hidden className="absolute inset-0 overflow-clip rounded-[6.675px] bg-chart-4" />
      <div className="absolute top-[calc(50%-0.12px)] left-[calc(50%+0.42px)] flex w-[100.123px] -translate-x-1/2 -translate-y-1/2 flex-col items-start">
        <div className="-mb-[10.012px] flex w-full items-center">
          <Condition
            color="text-background"
            icon={
              <ConditionIcon left={12.15} top={6.67} width={38.871}>
                <Vector src={megaphone} className="inset-0" />
              </ConditionIcon>
            }
          />
        </div>
        <p className={cn(TEXT, "text-background")}>EVENT</p>
      </div>
    </>
  ),
  skills: (
    <>
      <span
        aria-hidden
        className="absolute top-0 left-0 h-[68px] w-[335px] rounded-[6.675px] bg-accent-foreground"
      />
      <div className={cn(BADGE_CONTENT, "top-2 left-4")}>
        <Condition
          color="text-background"
          icon={
            <ConditionIcon left={11.3} top={7.85} width={37.262}>
              <Vector src={goal} className="inset-0" />
            </ConditionIcon>
          }
        />
        <div className="flex shrink-0 items-center gap-[8.598px]">
          <Result className="h-0 w-[22.929px]">
            <Vector src={skillsArrow} className="inset-[-10.63px_-6.29%] size-auto" />
          </Result>
          <p className={cn(TEXT, "text-background")}>REAL SKILLS</p>
        </div>
      </div>
    </>
  ),
  code: (
    <>
      <span aria-hidden className="absolute inset-0 rounded-[37.546px] bg-chart-2" />
      <div className={cn(BADGE_CONTENT, "top-[7.51px] left-[16.69px]")}>
        <Condition
          color="text-background"
          icon={
            <ConditionIcon left={12.97} top={8.69} width={34.896}>
              <div className="absolute inset-[16.67%_8.33%]">
                <div className="absolute inset-[-4.69%_-3.75%]">
                  <Vector src={binaryCode} className="inset-0" />
                </div>
              </div>
            </ConditionIcon>
          }
        />
        <Result className="h-[38.431px] w-[69.958px]">
          <Vector src={codeResult} className="inset-[0_0_0_-2.06%] size-auto" />
        </Result>
      </div>
    </>
  ),
}
