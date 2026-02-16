import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '../../../app/ThemeContext'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ children, variant = 'primary', className = '', ...rest }: ButtonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
    secondary:
      isDark
        ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500'
        : 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400',
    ghost:
      isDark
        ? 'bg-transparent text-slate-300 hover:bg-slate-800 focus-visible:ring-slate-600'
        : 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
