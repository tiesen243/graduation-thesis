import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const typographyVariants = cva('text-base font-normal', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance',
      h2: 'scroll-m-20 text-2xl font-bold tracking-tight text-balance',
      h3: 'scroll-m-20 text-xl font-semibold tracking-tight text-balance',
      h4: 'scroll-m-20 text-lg font-semibold tracking-tight text-balance',
      p: 'text-justify leading-7 text-pretty',
      small: 'block text-sm leading-none font-medium tracking-wide',
      ul: 'ml-6 list-disc text-base [&>li]:mt-2 [&>li]:first:mt-0',
      ol: 'ml-6 list-decimal text-base [&>li]:mt-2 [&>li]:first:mt-0',
      blockquote:
        'inline-block border-l-2 pl-6 italic before:content-["“"] after:content-["”"]',
      code: 'border-accent bg-accent/40 text-accent-foreground relative w-fit rounded-sm border px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium',
      caption:
        'text-muted-foreground mt-1 block text-center text-sm tracking-wide',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
})

interface TypographyProps
  extends React.ComponentProps<'p'>, VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

function Typography({
  className,
  variant = 'p',
  as,
  ...props
}: TypographyProps) {
  const Comp = as ?? variant ?? 'p'

  return (
    <Comp
      data-slot='typography'
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
