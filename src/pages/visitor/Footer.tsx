import React from "react";
import { Link } from "react-router-dom";
import logo from "../../components/ui/Logo.png";

export const Footer: React.FC = () => (
    <footer className="bg-fsc-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <img src={logo} alt="GPSC Logo" className="h-12 w-12 rounded-full object-contain mix-blend-lighten" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-bold">
                                <span className="text-white">FaithShield </span>
                                <span style={{ color: "#C41E1E" }}>Care</span>
                            </div>
                            <div className="font-body text-[10px] italic text-white/50">Guided by Faith, Driven by Care</div>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">
                        A community-based membership organization providing affordable financial assistance, livelihood opportunities, and compassionate care — inspired by Christian values and the Bayanihan spirit.
                    </p>
                </div>
                <div>
                    <div className="mb-4 text-xs tracking-wider text-white/40 uppercase">Program</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>
                            <Link to="/membership" className="transition-colors hover:text-white">
                                Membership Packages
                            </Link>
                        </li>
                        <li>
                            <Link to="/referral" className="transition-colors hover:text-white">
                                Referral Program
                            </Link>
                        </li>
                        <li>
                            <Link to="/membership" className="transition-colors hover:text-white">
                                Benefits & Claims
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="transition-colors hover:text-white">
                                Livelihood Programs
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="mb-4 text-xs tracking-wider text-white/40 uppercase">Company</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>
                            <Link to="/about" className="transition-colors hover:text-white">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="transition-colors hover:text-white">
                                Officers & Board
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="transition-colors hover:text-white">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="mb-4 text-xs tracking-wider text-white/40 uppercase">Legal</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Data Privacy
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Refund Policy
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40">
                <div>© 2026 FaithShield Care · Philippines</div>
                <div className="font-display italic">Guided by Faith, Driven by Care</div>
            </div>
        </div>
    </footer>
);
