import { AlertTriangle } from "lucide-react";

interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    busy = false,
    onConfirm,
    onCancel,
}: Props) {
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => !busy && onCancel()}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            danger ? "bg-red-100 text-red-600" : "bg-gpsc-cream text-gpsc-navy"
                        }`}
                    >
                        <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-display text-gpsc-navy text-lg">{title}</h2>
                        <p className="text-gpsc-stone mt-1 text-sm">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-xl border py-2.5 text-sm transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 ${
                            danger ? "bg-red-600 hover:bg-red-700" : "bg-gpsc-green hover:opacity-90"
                        }`}
                    >
                        {busy ? "Working…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
