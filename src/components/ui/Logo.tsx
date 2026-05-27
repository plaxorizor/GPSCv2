interface LogoProps {
    size?: number;
    mono?: boolean;
}

export function Logo({ size = 56, mono = false }: LogoProps) {
    const navy = mono ? "currentColor" : "#14365C";
    const green = mono ? "currentColor" : "#4A8A2C";

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke={navy} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 20 70 Q 30 55, 45 60 T 80 55" stroke={green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 25 75 Q 40 65, 55 70 T 82 65" stroke={navy} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M 50 25 L 50 38 M 44 31 L 56 31" stroke={navy} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="68" cy="42" r="6" fill={green} opacity="0.85" />
            <circle cx="72" cy="38" r="3" fill={green} />
            <path d="M 30 55 Q 35 48, 32 42 Q 30 38, 33 35" stroke={navy} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
    );
}
