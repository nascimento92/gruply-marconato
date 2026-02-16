import type { ReactNode } from 'react'
import { useTheme } from '../../../app/ThemeContext'

interface TableProps {
  headers: string[]
  children: ReactNode
}

export function Table({ headers, children }: TableProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={
        isDark
          ? 'overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60'
          : 'overflow-hidden rounded-xl border border-slate-200 bg-white'
      }
    >
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className={isDark ? 'bg-slate-900' : 'bg-slate-100'}>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={
                  isDark
                    ? 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400'
                    : 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'
                }
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={
            isDark
              ? 'divide-y divide-slate-800 bg-slate-950/40'
              : 'divide-y divide-slate-100 bg-white'
          }
        >
          {children}
        </tbody>
      </table>
    </div>
  )
}
