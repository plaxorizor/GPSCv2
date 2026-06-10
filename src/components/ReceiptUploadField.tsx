import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface Props {
    file: File | null;
    onChange: (file: File | null) => void;
    /** Max size in MB (default 5). Mirrors the Storage rule cap. */
    maxMB?: number;
}

// Shared payment-proof picker used on signup / upgrade / renewal. Validates that
// the file is an image under the size cap, shows a thumbnail preview, and lets the
// member clear it. Styling uses neutral grays so it sits well inside both the
// signup card (custom tokens) and the member modals (fsc-* classes).
export default function ReceiptUploadField({ file, onChange, maxMB = 5 }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");

    // Derive the preview URL from the file (no effect needed to set it), then
    // revoke it on change/unmount so we don't leak object URLs.
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    const pick = (f: File | null) => {
        setError("");
        if (!f) {
            onChange(null);
            return;
        }
        if (!f.type.startsWith("image/")) {
            setError("Please choose an image file (JPG or PNG).");
            return;
        }
        if (f.size > maxMB * 1024 * 1024) {
            setError(`Image must be under ${maxMB} MB.`);
            return;
        }
        onChange(f);
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />

            {preview ? (
                <div className="relative overflow-hidden rounded-xl border border-[#D0D2D8] bg-white">
                    <img src={preview} alt="Receipt preview" className="max-h-56 w-full object-contain" />
                    <button
                        type="button"
                        onClick={() => pick(null)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                        aria-label="Remove receipt"
                    >
                        <X size={14} />
                    </button>
                    <div className="truncate border-t border-[#D0D2D8] px-3 py-2 text-xs text-[#6B6862]">{file?.name}</div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#D0D2D8] bg-[#F2F3F5] px-4 py-6 text-center transition-colors hover:border-[#C9922A] hover:bg-[#F2F3F5]/60"
                >
                    <Upload size={20} className="text-[#6B6862]" />
                    <span className="text-sm font-medium text-[#1B2D6B]">Upload receipt screenshot</span>
                    <span className="text-xs text-[#6B6862]">JPG or PNG, up to {maxMB} MB</span>
                </button>
            )}

            {error && <p className="mt-1.5 text-xs text-[#C41E1E]">{error}</p>}
        </div>
    );
}
