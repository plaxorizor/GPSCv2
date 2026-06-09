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
            className={`group bg-fsc-navy hover:bg-fsc-green fixed bottom-20 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl active:scale-95 lg:bottom-6 lg:right-6 ${
                visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
            }`}
        >
            <ArrowUp size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
    );
}
