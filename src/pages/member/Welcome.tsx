import logo from "../../components/ui/Logo.png";

// Shown once when a member's account becomes active (after admin activation).
// The parent owns visibility + the "seen" flag; this just renders + calls onClose.
function WelcomeModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={logo} alt="FaithShield Care" className="mx-auto mb-5 h-16 w-16 rounded-full object-contain" />
                <h2 className="font-display text-fsc-navy text-2xl">Welcome to the FaithShield Care Family!</h2>
                <div className="text-fsc-stone mt-4 space-y-4 text-left text-sm leading-relaxed">
                    <p>
                        We sincerely appreciate your trust and confidence in choosing us as your partner in securing your future and protecting what
                        matters most.
                    </p>
                    <p>
                        As part of our growing family, you can expect our unwavering commitment to providing care, support, and reliable service every
                        step of the way. We are honored to be part of your journey toward greater peace of mind, financial security, and protection
                        for you and your loved ones.
                    </p>
                    <p>Thank you for joining FaithShield Care. We look forward to serving you with excellence, integrity, and compassion.</p>
                </div>
                <p className="font-display text-fsc-green mt-6 text-lg italic">Care Beyond Protection</p>
                <button
                    onClick={onClose}
                    className="bg-fsc-green mt-6 w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    Proceed
                </button>
            </div>
        </div>
    );
}

export default WelcomeModal;
