import { cva, type VariantProps } from 'class-variance-authority'

export { default as Avatar } from './Avatar.vue'
export { default as AvatarFallback } from './AvatarFallback.vue'
export { default as AvatarImage } from './AvatarImage.vue'

export const avatarVariant = cva(
  'inline-flex items-center justify-center font-normal text-foreground select-none shrink-0 bg-secondary overflow-hidden',
  {
    variants: {
      size: {
        xs: 'size-6 text-xs',
        sm: 'size-8 text-xs',
        base: 'size-12 text-lg',
        lg: 'size-18 text-2xl',
        xl: 'size-24 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
  }
)

export type AvatarVariants = VariantProps<typeof avatarVariant>
