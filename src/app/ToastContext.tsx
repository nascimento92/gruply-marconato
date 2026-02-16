import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ToastType } from '../presentation/components/ui/Toast'
import { Toast } from '../presentation/components/ui/Toast'

interface ToastItem {
    id: string
    message: string
    type: ToastType
}

interface ToastContextValue {
    showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const showToast = (message: string, type: ToastType) => {
        const id = crypto.randomUUID()
        setToasts((current) => [...current, { id, message, type }])
    }

    const removeToast = (id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }

    const value = useMemo(() => ({ showToast }), [])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast deve ser usado dentro de ToastProvider')
    }
    return context
}
