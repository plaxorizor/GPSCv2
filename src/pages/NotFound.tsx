import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../components/ui/Logo.png";

export default function NotFound(): React.ReactElement {
    const navigate = useNavigate();

    return (
        <div className="font-body text-fsc-ink flex min-h-screen flex-col items-center justify-center bg-[#F2F3F5] px-6 text-center">
            <button onClick={() => navigate("/")} className="mb-10 flex items-center gap-3 cursor-pointer">
                <img src={logo} alt="FaithShield Care" className="h-10 w-10 rounded-full object-contain" />
                <div className="leading-tight text-left">
                    <div className="font-display text-base font-bold tracking-tight">
                        <span className="text-fsc-navy">FaithShield </span>
                        <span style={{ color: "#C41E1E" }}>Care</span>
                    </div>
                    <div className="font-body text-fsc-stone text-[10px] tracking-wide italic">Guided by Faith, Driven by Care</div>
                </div>
            </button>

            <div className="font-display text-fsc-navy/10 text-[9rem] leading-none select-none lg:text-[12rem]">
                404
            </div>

            <h1 className="font-display text-fsc-navy mt-2 text-3xl lg:text-4xl">Page not found</h1>
            <p className="text-fsc-stone mt-4 max-w-sm text-base leading-relaxed">
                The page you're looking for doesn't exist or may have been moved.
            </p>

            <button
                onClick={() => navigate("/")}
                className="bg-fsc-navy hover:bg-fsc-green group mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-3.5 font-medium text-white transition-colors"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to home
            </button>
        </div>
    );
}
