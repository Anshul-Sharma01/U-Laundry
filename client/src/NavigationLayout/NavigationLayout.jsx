import { useState } from "react";
import { Link } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import ThemeToggle from "../Components/Theme/ThemeToggle.jsx";
import { useSelector } from "react-redux";

function NavigationLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userData = useSelector((state) => state?.auth?.userData);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="text-gray-900 dark:text-gray-100">
        {/* Navbar */}
            <nav className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 shadow-md">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/u-laundry.svg" className="h-6 md:h-8" alt="U-logo" />
                </div>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-8">
                    <li>
                        <Link
                            to="/"
                            className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/orders/my-orders"
                            className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                            My Orders
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/user/me"
                            className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                            My Profile
                        </Link>
                    </li>
                    <li>
                        <ThemeToggle />
                    </li>
                </ul>

                {/* Mobile Navigation */}
                <div className="flex items-center md:hidden gap-4">
                    <ThemeToggle />
                    <button
                        onClick={toggleMobileMenu}
                        className="focus:outline-none"
                        aria-label="Open mobile menu"
                    >
                        <img src={userData?.avatar?.secure_url} className="h-8 dark:text-gray-100 rounded-full" />
                    </button>
                </div>
            </nav>

        {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden absolute inset-x-0 top-0 z-10 bg-gray-200 dark:bg-gray-800 shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <ul className="flex flex-col items-center py-4 gap-6">
                        <li>
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/orders/my-orders"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                            >
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/user/me"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm md:text-base hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                            >
                                My Profile
                            </Link>
                        </li>
                    </ul>
                </div>
            )}

            {/* Main Content */}
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {children}
            </main>
        </div>
    );
}

export default NavigationLayout;
