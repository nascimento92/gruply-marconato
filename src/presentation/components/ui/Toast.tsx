import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
    id: string
    message: string
    type: ToastType
    onClose: (id: string) => void
}

export function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id)
        }, 3000)

        return () => clearTimeout(timer)
    }, [id, onClose])

    const bgColors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }

    const icons = {
        success: (
            <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        ),
        error: (
            <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        ),
        info: (
            <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    }

    return (
        <div className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition ease-in-out dark:bg-slate-800 dark:ring-slate-700">
            <div className={`w-2 ${bgColors[type]}`} />
            <div className="flex w-0 flex-1 items-center p-4">
                <div className="flex-shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColors[type]}`}>
                        {icons[type]}
                    </div>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{message}</p>
                </div>
            </div>
            <div className="flex border-l border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => onClose(id)}
                    className="flex w-full items-center justify-center border border-transparent p-4 text-sm font-medium text-slate-600 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-300"
                >
                    Fechar
                </button>
            </div>
        </div>
    )
}
