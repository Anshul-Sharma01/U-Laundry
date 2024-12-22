import { useState } from "react";
import { Link } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import ThemeToggle from "../Components/Theme/ThemeToggle.jsx";

function NavigationLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div>
            <div className="text-gray-900 dark:text-gray-100 font-bold ">
                <nav className="flex justify-between items-center h-[40px] p-4 bg-white dark:bg-gray-900 shadow-md">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img src="/u-laundry.svg" className="h-[22px]" alt="U-logo" />
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-10">
                        <li>
                            <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-300">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/orders" className="hover:text-blue-500 dark:hover:text-blue-300">
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile" className="hover:text-blue-500 dark:hover:text-blue-300">
                                My Profile
                            </Link>
                        </li>
                        <li>
                            <ThemeToggle/>
                        </li>
                    </ul>

                    {/* Avatar Icon for Mobile */}
                    <div className="flex items-center gap-10 md:hidden">
                        <ThemeToggle/>
                        <button
                            onClick={toggleMobileMenu}
                            className="flex items-center focus:outline-none"
                        >
                            <RxAvatar className="text-4xl dark:text-gray-100" />
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-200 dark:bg-gray-800 p-4">
                        <ul className="flex flex-col items-start gap-4">
                            <li>
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-blue-500 dark:hover:text-blue-300"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/orders"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-blue-500 dark:hover:text-blue-300"
                                >
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-blue-500 dark:hover:text-blue-300"
                                >
                                    My Profile
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

export default NavigationLayout;
