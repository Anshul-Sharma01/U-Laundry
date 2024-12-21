import { useState } from "react";
import { Link } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";

function NavigationLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);


    return (
        <div className= " text-gray-900 font-bold bg-red-200">
            <nav className="flex justify-between items-center h-[40px] p-4">
                {/* Logo */}
                <div className="flex items-center">
                <img src="/u-laundry.svg" className="h-[22px]" alt="U-logo" />
                </div>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-10">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/orders">My Orders</Link>
                </li>
                <li>
                    <Link to="/profile">My Profile</Link>
                </li>
                </ul>

                {/* Avatar Icon for Mobile */}
                <div className="flex items-center md:hidden">
                    <button onClick={toggleMobileMenu} className="flex items-center focus:outline-none">
                        <RxAvatar className="text-4xl"/>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-200 dark:bg-gray-800 p-4">
                    <ul className="flex flex-col items-start gap-4">
                        <li>
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        </li>
                        <li>
                            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                        </li>
                        <li>
                            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default NavigationLayout;
