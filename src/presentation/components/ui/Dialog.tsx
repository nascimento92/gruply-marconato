import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface DialogProps {
    isOpen: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    isDestructive?: boolean
}

export function Dialog({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    isDestructive = false,
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={dialogRef}
                className="w-full max-w-md scale-100 overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all dark:bg-slate-900"
            >
                <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <button
                        onClick={onConfirm}
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDestructive
                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
