import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-lexend font-medium rounded-3xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:   'bg-terracotta text-white shadow-soft hover:bg-terracotta-600 active:bg-terracotta-700',
      secondary: 'bg-sage text-white shadow-soft hover:bg-sage-600 active:bg-sage-700',
      ghost:     'bg-transparent text-terracotta-800 hover:bg-terracotta-50 border border-terracotta-200',
      danger:    'bg-dusty-rose-400 text-white shadow-soft hover:bg-dusty-rose-500',
    }

    const sizes = {
      sm: 'text-xs px-4 py-2',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-7 py-3.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
