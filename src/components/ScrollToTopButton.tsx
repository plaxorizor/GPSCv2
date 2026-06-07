import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 320);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
            className="bg-fsc-navy hover:bg-fsc-green fixed bottom-20 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white shadow-lg lg:bottom-6 lg:right-6"
        >
            <ArrowUp size={18} />
        </button>
    );
}
