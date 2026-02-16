import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { login } = useAppState()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const authenticated = await login({ email, password })
    if (!authenticated) {
      setError('Credenciais inválidas')
    }

    setIsSubmitting(false)
  }

  return (
    <div
      className={
        isDark
          ? 'flex min-h-screen items-center justify-center bg-slate-950 px-4'
          : 'flex min-h-screen items-center justify-center bg-slate-100 px-4'
      }
    >
      <div
        className={
          isDark
            ? 'w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl'
            : 'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'
        }
      >
        <header className="mb-6 text-center">
          <h1
            className={
              isDark
                ? 'mb-1 text-2xl font-semibold text-slate-50'
                : 'mb-1 text-2xl font-semibold text-slate-900'
            }
          >
            Marconato
          </h1>
          <p className="text-xs text-slate-400">
            Acesse para gerenciar vendas, clientes, produtos e estoque
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label="Senha"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p className="text-xs font-medium text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>


          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1 text-xs"
              onClick={toggleTheme}
            >
              {isDark ? 'Modo claro' : 'Modo escuro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
