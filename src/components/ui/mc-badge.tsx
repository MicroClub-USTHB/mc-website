import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

import { cn } from '@/lib/utils';

const McBadgeVariants = cva(
  'group/badge inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[16px] border border-border text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:self-center',
  {
    variants: {
      variant: {
        default:
          'bg-primary-foreground text-primary dark:border-primary/25 dark:bg-primary/10 [a]:hover:bg-primary-foreground/80',
        secondary:
          'bg-secondary text-secondary-foreground dark:border-transparent [a]:hover:bg-secondary/80',
        // Dark: a faint tint of the tone with a lighter text, so the label stays readable on the
        // dark surfaces (the light tints of the `*-foreground` tokens would glare).
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:border-destructive/30 dark:bg-destructive/15 dark:text-[color-mix(in_srgb,var(--color-destructive)_55%,white)] dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        info: 'bg-info-foreground text-info dark:border-info/30 dark:bg-info/15 dark:text-[color-mix(in_srgb,var(--color-info)_55%,white)]',
        warning:
          'bg-warning-foreground text-warning dark:border-warning/30 dark:bg-warning/15 dark:text-[color-mix(in_srgb,var(--color-warning)_65%,white)]',
        success:
          'bg-success-foreground text-success dark:border-success/30 dark:bg-success/15 dark:text-[color-mix(in_srgb,var(--color-success)_70%,white)]',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        leading: 'bg-accent-foreground text-accent',
      },
      size: {
        sm: 'h-[22px] min-w-[47px] px-2 py-0.5 text-sm leading-[18px]',
        md: 'h-[24px] min-w-[56px] px-[10px] py-0.5 text-sm leading-[20px]',
        lg: 'h-[32px] min-w-[65px] px-3 py-1 text-sm leading-[24px]',
        groupMd: 'h-[22px] min-w-[47px] px-2 py-0.5 text-sm leading-[18px]',
        groupLg: 'h-[28px] min-w-[56px] px-[10px] py-1 text-sm leading-[20px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

function McBadge({
  className,
  variant = 'default',
  size = 'sm',
  render,
  icon,
  iconPosition = 'start',
  iconOnly = false,
  image,
  imageAlt = '',
  imagePosition = 'start',
  leadingBadge,
  leadingBadgePosition = 'start',
  leadingBadgeIcon,
  groupSize = 'md',
  children,
  ...props
}: useRender.ComponentProps<'span'> &
  VariantProps<typeof McBadgeVariants> & {
    icon?: ReactNode;
    iconPosition?: 'start' | 'end';
    iconOnly?: boolean;
    image?: string;
    imageAlt?: string;
    imagePosition?: 'start' | 'end';
    leadingBadge?: ReactNode;
    leadingBadgePosition?: 'start' | 'end';
    leadingBadgeIcon?: ReactNode;
    groupSize?: 'md' | 'lg';
  }) {
  const groupSizeClasses = {
    md: 'h-[30px] leading-[22px]',
    lg: 'h-[36px] leading-[26px]',
  } as const;
  const groupChildSize = groupSize === 'md' ? 'groupMd' : 'groupLg';

  const imageEl = image ? (
    <img src={image} alt={imageAlt} className="size-4 shrink-0 rounded-full object-cover" />
  ) : null;

  const useParentIcon = !leadingBadge || leadingBadgePosition === 'start';
  const rawIcon = useParentIcon ? icon : undefined;
  const parentIcon = rawIcon ? (
    <span style={{ display: 'contents', pointerEvents: 'none' }}>
      <span
        style={{
          width: 12,
          height: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {rawIcon}
      </span>
    </span>
  ) : undefined;

  const parentIconPlacement = parentIcon
    ? iconPosition === 'end'
      ? 'inline-end'
      : 'inline-start'
    : undefined;

  const contentWithIcon = parentIcon ? (
    iconPosition === 'end' ? (
      <>
        {children}
        {parentIcon}
      </>
    ) : (
      <>
        {parentIcon}
        {children}
      </>
    )
  ) : (
    children
  );

  const content = imageEl ? (
    imagePosition === 'end' ? (
      <>
        {contentWithIcon}
        {imageEl}
      </>
    ) : (
      <>
        {imageEl}
        {contentWithIcon}
      </>
    )
  ) : (
    contentWithIcon
  );

  const resolvedLeadingBadge = leadingBadge ? (
    isValidElement(leadingBadge) ? (
      cloneElement(leadingBadge as React.ReactElement<Record<string, unknown>>, {
        size: groupChildSize,
        variant: 'leading', // ← forcé
        icon: leadingBadgePosition === 'end' ? leadingBadgeIcon : undefined,
        iconPosition: 'end',
      })
    ) : (
      <McBadge
        size={groupChildSize}
        variant="leading" // ← forcé
        icon={leadingBadgePosition === 'end' ? leadingBadgeIcon : undefined}
        iconPosition="end"
      >
        {leadingBadge}
      </McBadge>
    )
  ) : null;

  const groupedContent = resolvedLeadingBadge ? (
    leadingBadgePosition === 'end' ? (
      <div className="flex items-center gap-3">
        {content}
        {resolvedLeadingBadge}
      </div>
    ) : (
      <div className="flex items-center gap-3">
        {resolvedLeadingBadge}
        {content}
      </div>
    )
  ) : (
    content
  );

  const dataIconProps = parentIconPlacement
    ? ({ 'data-icon': parentIconPlacement } as Record<string, string>)
    : undefined;

  const iconOnlyClasses = iconOnly ? 'min-w-0 px-1.5' : undefined;

  const imagePaddingClasses = image
    ? imagePosition === 'start'
      ? 'pl-[3px]'
      : 'pr-[3px]'
    : undefined;

  const groupPaddingClasses = resolvedLeadingBadge
    ? leadingBadgePosition === 'start'
      ? 'pl-1 pr-[10px]'
      : 'pl-[10px] pr-1'
    : undefined;

  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(
          McBadgeVariants({ variant, size }),
          leadingBadge ? groupSizeClasses[groupSize] : undefined,
          iconOnlyClasses,
          imagePaddingClasses,
          groupPaddingClasses,
          className
        ),
        ...(dataIconProps ?? {}),
        children: groupedContent,
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
      size,
    },
  });
}

export { McBadge, McBadgeVariants };
