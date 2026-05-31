import React from "react";
import { Link } from "react-router-dom";
import logo from "../../components/ui/Logo.png";

export const Footer: React.FC = () => (
    <footer className="bg-gpsc-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <img src={logo} alt="GPSC Logo" className="h-12 w-12 rounded-full object-contain mix-blend-lighten" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-semibold text-white">Green Pasture</div>
                            <div className="font-display text-gpsc-green text-xs italic">Shepherd's Care</div>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">
                        A community-owned safety net for Filipino families, rooted in faith and Bayanihan spirit.
                    </p>
                </div>
                <div>
                    <div className="mb-4 text-xs tracking-wider text-white/40 uppercase">Program</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>
                            <Link to="/membership" className="transition-colors hover:text-white">
                                Membership packages
                            </Link>
                        </li>
                        <li>
                            <Link to="/referral" className="transition-colors hover:text-white">
                                Referral program
                            </Link>
                        </li>
                        <li>
                            <Link to="/membership" className="transition-colors hover:text-white">
                                Benefits & claims
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="transition-colors hover:text-white">
                                Livelihood programs
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
                                Officers & board · Press
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
                                Privacy policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Terms of service
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Data privacy
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="transition-colors hover:text-white">
                                Refund policy
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40">
                <div>© 2026 Green Pasture Shepherd's Care · Davao City, Philippines</div>
                <div className="font-display italic">We Care · We Serve · We Share</div>
            </div>
        </div>
    </footer>
);
