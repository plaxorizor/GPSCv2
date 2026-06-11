import React from "react";
import { Link } from "react-router-dom";
import logo from "../ui/Logo.png";

export const Footer: React.FC = () => (
    <footer data-theme="dark" className="bg-fsc-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <img src={logo} alt="FaithShield Care Logo" className="h-12 w-12 rounded-full object-contain mix-blend-lighten" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-bold">
                                <span className="text-white">FaithShield </span>
                                <span style={{ color: "#C41E1E" }}>Care</span>
                            </div>
                            <div className="font-body text-[10px] text-white/50 italic">Guided by Faith, Driven by Care</div>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">
                        A community-based membership organization providing affordable financial assistance, livelihood opportunities, and
                        compassionate care — inspired by Christian values and the Bayanihan spirit.
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                        <span className="text-xs tracking-wider text-white/40 uppercase">Follow us</span>
                        <a
                            href="https://www.facebook.com/faithshieldcare"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="FaithShield Care on Facebook"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                    </div>
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
                            <Link to="/privacy-policy" className="transition-colors hover:text-white">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/terms-of-service" className="transition-colors hover:text-white">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link to="/data-privacy" className="transition-colors hover:text-white">
                                Data Privacy
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
