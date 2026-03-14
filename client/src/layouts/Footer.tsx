
import { Link } from "react-router-dom";
import { LOGO } from "../constants";

export const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-10 border-t border-accent/20 bg-bg/80 backdrop-blur">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between">
                    {/* Brand + short description */}
                    <div className="max-w-sm space-y-3">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            {LOGO && (
                                <img
                                    src={LOGO}
                                    alt="U-Laundry"
                                    className="h-8 w-auto rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                                />
                            )}
                            <span className="text-base font-extrabold tracking-tight text-text">
                                U-Laundry
                            </span>
                        </Link>
                        <p className="text-xs sm:text-sm text-muted leading-relaxed">
                            A campus-first laundry platform to help students schedule pickups, track
                            orders, and stay worry-free about clean clothes during a busy semester.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                                Navigation
                            </h3>
                            <ul className="space-y-1.5">
                                <li>
                                    <Link
                                        to="/"
                                        className="text-text/80 hover:text-primary text-sm transition-colors"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/contact"
                                        className="text-text/80 hover:text-primary text-sm transition-colors"
                                    >
                                        Contact & FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/profile"
                                        className="text-text/80 hover:text-primary text-sm transition-colors"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                                Service
                            </h3>
                            <ul className="space-y-1.5 text-xs sm:text-sm text-muted">
                                <li>Standard turnaround: 24–48 hours</li>
                                <li>Operating hours: 9:00 AM – 8:00 PM</li>
                                <li>Pickup at hostel service block</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                                Contact
                            </h3>
                            <ul className="space-y-1.5 text-xs sm:text-sm text-muted">
                                <li className="break-all">ulaundry.support@college.edu</li>
                                <li>Sample helpline: +91-98765-00000</li>
                                <li>For real deployment, plug in official details.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="mt-8 pt-4 border-t border-accent/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] sm:text-xs text-muted">
                        © {year} U-Laundry. Built as a university project demo. All names and contacts
                        are sample placeholders.
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted">
                        Designed for a clean, modern campus experience.
                    </p>
                </div>
            </div>
        </footer>
    );
};