import { useState } from "react";
import { createPaymentLink } from "../firebase/payments";

const PACKAGES = [
    { id: "basic", label: "Basic", price: "₱698", levels: "Level 1 only" },
    { id: "family", label: "Family", price: "₱1,698", levels: "Levels 1–3" },
    { id: "premium", label: "Premium", price: "₱4,998", levels: "Levels 1–6" },
] as const;

const Packages = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleSelect = async (pkg: "basic" | "family" | "premium") => {
        setLoading(pkg);
        setError("");
        try {
            const { checkoutUrl } = await createPaymentLink(pkg);
            window.location.href = checkoutUrl; // redirect to PayMongo checkout
        } catch (err: any) {
            setError(err.message);
            setLoading(null);
        }
    };

    return (
        <div>
            <h2>Choose Your Package</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {PACKAGES.map((pkg) => (
                    <div
                        key={pkg.id}
                        style={{
                            padding: 24,
                            border: "1px solid #ddd",
                            borderRadius: 12,
                            textAlign: "center",
                        }}
                    >
                        <h3>{pkg.label}</h3>
                        <p style={{ fontSize: 28, fontWeight: 700 }}>{pkg.price}</p>
                        <p style={{ color: "#888", fontSize: 13 }}>Earns from: {pkg.levels}</p>
                        <button onClick={() => handleSelect(pkg.id)} disabled={loading === pkg.id} style={{ marginTop: 12, width: "100%" }}>
                            {loading === pkg.id ? "Redirecting..." : "Subscribe"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Packages;
