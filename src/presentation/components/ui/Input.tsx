import type { InputHTMLAttributes } from 'react'
import { useTheme } from '../../../app/ThemeContext'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className={
          isDark
            ? 'block text-xs font-medium text-slate-300'
            : 'block text-xs font-medium text-slate-700'
        }
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-300 bg-white text-slate-900'
        } ${className}`}
        {...rest}
      />
    </div>
  )
}
