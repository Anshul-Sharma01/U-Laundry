import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { useState, useEffect } from 'react';
import {
    HiBars3, HiXMark, HiArrowRightOnRectangle,
    HiUser, HiHome, HiBell
} from 'react-icons/hi2';

export default function Navbar() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector((s: RootState) => s.auth);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/auth/sign-in');
    };

    return (
        <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled
                ? 'py-3 bg-white/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-white/20'
                : 'py-5 bg-transparent'}
    `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-primary to-secondary shadow-[0_4px_12px_rgba(224,0,0,0.3)]
              transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3
            `}>
                            <span className="text-white font-extrabold text-xl">U</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-text">
                            Laundry
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    {isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-6">
                            <NavLink to="/" icon={<HiHome size={18} />} label="Dashboard" />
                            <NavLink to="/orders" icon={<HiBell size={18} />} label="Orders" />
                            <NavLink to="/profile" icon={<HiUser size={18} />} label="Profile" />

                            <div className="h-6 w-[1.5px] bg-accent/40 mx-2" />

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-text leading-tight">{user?.name}</span>
                                    <span className="text-xs font-semibold text-primary capitalize">{user?.role}</span>
                                </div>
                                {user?.avatar?.secure_url ? (
                                    <img src={user.avatar.secure_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="ml-3 p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                    aria-label="Logout"
                                >
                                    <HiArrowRightOnRectangle size={22} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/auth/sign-in" className="px-5 py-2.5 text-sm font-semibold text-text hover:text-primary transition-colors">
                                Log In
                            </Link>
                            <Link to="/auth/sign-up" className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(224,0,0,0.3)] hover:bg-secondary hover:-translate-y-0.5 transition-all">
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 -mr-2 text-text hover:text-primary transition-colors"
                        >
                            {mobileMenuOpen ? <HiXMark size={28} /> : <HiBars3 size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-surface border-b shadow-xl p-4 animate-slide-in">
                    {isLoggedIn ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 p-3 bg-bg rounded-xl mb-2">
                                {user?.avatar?.secure_url ? (
                                    <img src={user.avatar.secure_url} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-text">{user?.name}</p>
                                    <p className="text-xs font-semibold text-primary capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <MobileNavLink to="/" icon={<HiHome size={20} />} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                            <MobileNavLink to="/orders" icon={<HiBell size={20} />} label="Orders" onClick={() => setMobileMenuOpen(false)} />
                            <MobileNavLink to="/profile" icon={<HiUser size={20} />} label="Profile" onClick={() => setMobileMenuOpen(false)} />

                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                            >
                                <HiArrowRightOnRectangle size={20} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link to="/auth/sign-in" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 bg-bg text-text rounded-xl font-semibold">
                                Log In
                            </Link>
                            <Link to="/auth/sign-up" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 bg-primary text-white rounded-xl font-bold">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

function NavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary transition-colors py-2 group"
        >
            <span className="text-accent group-hover:text-primary transition-colors">{icon}</span>
            {label}
        </Link>
    );
}

function MobileNavLink({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text font-semibold hover:bg-bg hover:text-primary transition-colors"
        >
            <span className="text-secondary">{icon}</span>
            {label}
        </Link>
    );
}
