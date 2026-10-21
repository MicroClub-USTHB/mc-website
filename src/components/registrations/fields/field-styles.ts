/**
 * Figma sizes on top of the mcoli-ui fields (their defaults are 14px text and 40px high inputs):
 * 16px / 24px label and text, 44px high inputs (42px + the 1px borders).
 */
export const INPUT_FIELD_CLASS = [
  "[&_[data-slot=input-label]]:text-base [&_[data-slot=input-label]]:leading-6",
  "[&_[data-slot=input]]:h-10.5 [&_[data-slot=input]]:py-2 [&_[data-slot=input]]:text-base [&_[data-slot=input]]:leading-6",
].join(" ")

/** Textareas of step 2: 200px high with the label, answers in the foreground color. */
export const TEXTAREA_FIELD_CLASS = [
  "[&_[data-slot=textarea-label]]:text-base [&_[data-slot=textarea-label]]:leading-6",
  "[&_[data-slot=textarea]]:h-42 [&_[data-slot=textarea]]:pb-7 [&_[data-slot=textarea]]:text-base [&_[data-slot=textarea]]:leading-6",
  "[&_[data-slot=textarea]]:placeholder:text-foreground",
].join(" ")

/** Label shared by the fields mcoli-ui has no label slot for (select, upload). */
export const FIELD_LABEL_CLASS = "text-base leading-6 font-medium text-muted-foreground"
