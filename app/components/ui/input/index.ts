import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'

export { default as Input } from './Input.vue'

export const inputVariants = cva(
  'flex rounded-md border border-input bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-9 px-3 py-1 text-sm file:text-sm',
        sm: 'h-8 px-2 text-xs file:text-xs',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export type InputVariants = VariantProps<typeof inputVariants>
