import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [visible, setVisible] = useState(false);
    // True when the button is floating over a dark/blue section (marked with
    // data-theme="dark", e.g. the footer, trust strip, CTA banner). On those it
    // flips to a white button so it doesn't disappear into the navy background.
    const [onDark, setOnDark] = useState(false);

    useEffect(() => {
        const update = () => {
            setVisible(window.scrollY > 320);

            const btn = btnRef.current;
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;

            const dark = Array.from(document.querySelectorAll('[data-theme="dark"]')).some((el) => {
                const b = el.getBoundingClientRect();
                return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom;
            });
            setOnDark(dark);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <button
            ref={btnRef}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={`group fixed bottom-20 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl active:scale-95 lg:bottom-6 lg:right-6 ${
                onDark ? "bg-white text-fsc-navy hover:bg-white" : "bg-fsc-navy hover:bg-fsc-green text-white"
            } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
        >
            <ArrowUp size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
    );
}
