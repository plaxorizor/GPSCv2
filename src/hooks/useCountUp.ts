import { useState, useEffect } from "react";

export function useCountUp(target: number, duration = 1800, delay = 400) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let rafId: number;
        let startTime: number | null = null;

        const timeout = setTimeout(() => {
            const step = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                setCount(eased * target);
                if (progress < 1) {
                    rafId = requestAnimationFrame(step);
                } else {
                    setCount(target);
                }
            };
            rafId = requestAnimationFrame(step);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(rafId);
        };
    }, [target, duration, delay]);

    return count;
}
