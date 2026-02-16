import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Button } from '../components/ui/Button'
import { DashboardPage } from '../pages/DashboardPage'
import { CustomersPage } from '../pages/CustomersPage'
import { ProductsPage } from '../pages/ProductsPage'
import { StockPage } from '../pages/StockPage'
import { MovementsPage } from '../pages/MovementsPage'

type SectionId = 'dashboard' | 'customers' | 'products' | 'stock' | 'movements'

interface Section {
  id: SectionId
  label: string
}

const sections: Section[] = [
  { id: 'dashboard', label: 'Visão geral' },
  { id: 'customers', label: 'Clientes' },
  { id: 'products', label: 'Produtos' },
  { id: 'stock', label: 'Estoque' },
  { id: 'movements', label: 'Entradas/Saídas' },
]

export function AppLayout() {
  const { user, logout } = useAppState()
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')

  const isDark = theme === 'dark'

  const renderSection = (): ReactNode => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />
      case 'customers':
        return <CustomersPage />
      case 'products':
        return <ProductsPage />
      case 'stock':
        return <StockPage />
      case 'movements':
        return <MovementsPage />
      default:
        return null
    }
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-slate-950 text-slate-100'
          : 'min-h-screen bg-slate-50 text-slate-900'
      }
    >
      <div className="flex min-h-screen">
        <aside
          className={
            isDark
              ? 'hidden w-64 border-r border-slate-800 bg-slate-950/80 px-4 py-6 md:block'
              : 'hidden w-64 border-r border-slate-200 bg-slate-50 px-4 py-6 md:block'
          }
        >
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                M
              </div>
              <div>
                <p className="text-sm font-semibold">Marconato</p>
                <p className="text-[11px] text-slate-400">Controle de vendas</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 text-sm">
            {sections.map((section) => {
              const isActive = section.id === activeSection
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-left transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-900'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {section.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <header
            className={
              isDark
                ? 'border-b border-slate-800 bg-slate-950/80 px-4 py-3'
                : 'border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur'
            }
          >
            <div className="flex items-center justify-between gap-3">
              <div className="md:hidden">
                <select
                  className={
                    isDark
                      ? 'rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 shadow-sm outline-none'
                      : 'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm outline-none'
                  }
                  value={activeSection}
                  onChange={(event) =>
                    setActiveSection(event.target.value as SectionId)
                  }
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h1
                  className={
                    isDark
                      ? 'text-sm font-semibold text-slate-50'
                      : 'text-sm font-semibold text-slate-900'
                  }
                >
                  {sections.find((section) => section.id === activeSection)?.label}
                </h1>
                <p
                  className={
                    isDark
                      ? 'text-[11px] text-slate-400'
                      : 'text-[11px] text-slate-500'
                  }
                >
                  Bem-vindo, {user?.name ?? 'usuário'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={
                    isDark
                      ? 'hidden text-[11px] text-slate-400 sm:inline'
                      : 'hidden text-[11px] text-slate-500 sm:inline'
                  }
                >
                  {user?.email}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={toggleTheme}
                >
                  {isDark ? 'Modo claro' : 'Modo escuro'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={logout}
                >
                  Sair
                </Button>
              </div>
            </div>
          </header>

          <section className="px-4 py-6">
            <div className="mx-auto max-w-6xl space-y-6">{renderSection()}</div>
          </section>
        </main>
      </div>
    </div>
  )
}
