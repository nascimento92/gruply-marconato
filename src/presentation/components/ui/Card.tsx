import type { ReactNode } from 'react'
import { useTheme } from '../../../app/ThemeContext'

interface CardProps {
  title?: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section
      className={
        isDark
          ? 'rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm'
          : 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
      }
    >
      {title && (
        <header className="mb-3 flex items-center justify-between">
          <h2
            className={
              isDark
                ? 'text-sm font-semibold text-slate-100'
                : 'text-sm font-semibold text-slate-900'
            }
          >
            {title}
          </h2>
        </header>
      )}
      <div className={isDark ? 'text-sm text-slate-200' : 'text-sm text-slate-700'}>
        {children}
      </div>
    </section>
  )
}
