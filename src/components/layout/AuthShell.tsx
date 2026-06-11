// components/layout/AuthShell.tsx
//
// Shared chrome for the standalone auth pages (Sign In, Forgot Password): the
// font-token <style>, the centered card layout, the back button, and the logo
// header. Each page supplies only its card contents as children. Also exports
// the shared input/label classes those pages use.

import { Link, useNavigate } from "react-router-dom";
import logoSrc from "../ui/Logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .fsc-signin-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .fsc-signin-root .font-display { font-family: 'Fraunces', Georgia, serif; }
  @keyframes signin-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .signin-anim { animation: signin-fade-up 0.5s ease-out forwards; }
`;

export const authInputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#D0D2D8] bg-white text-[#1B2D6B] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#C9922A] transition";
export const authLabelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

export default function AuthShell({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    return (
        <>
            <style>{css}</style>

            <div className="fsc-signin-root flex min-h-screen items-center justify-center px-6 py-12" style={{ backgroundColor: "#F2F3F5" }}>
                <div className="signin-anim mx-auto w-full max-w-md">
                    {/* ── Back Button ── */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-1 text-sm hover:underline"
                        style={{ color: "#6B6862" }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <div className="flex justify-center">
                            <Link to="/">
                                <img src={logoSrc} width={125} height={125} alt="Logo" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Card ── */}
                    <div className="space-y-4 rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #D0D2D8" }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
