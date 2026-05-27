import { loginUser } from "../firebase/auth";
import { useState } from "react";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try {
            await loginUser(email, password);
            // Redirect or show success message
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Login error:", error);
            // Show error message to user
        }
    };

    return (
        <div className="auth-container">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={signIn}>Sign In</button>
        </div>
    );
};
