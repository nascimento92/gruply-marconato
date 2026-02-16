import { AppStateProvider, useAppState } from './app/AppStateContext'
import { ThemeProvider } from './app/ThemeContext'
import { ToastProvider } from './app/ToastContext'
import { AppLayout } from './presentation/layout/AppLayout'
import { LoginPage } from './presentation/pages/LoginPage'

function AppContent() {
  const { user } = useAppState()
  if (!user) {
    return <LoginPage />
  }
  return <AppLayout />
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
