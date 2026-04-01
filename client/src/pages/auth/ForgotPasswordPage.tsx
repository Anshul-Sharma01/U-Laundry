import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearAuthMessages } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiArrowLeft } from 'react-icons/hi2';

export default function ForgotPasswordPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((s: RootState) => s.auth);

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }

        dispatch(clearAuthMessages());
        const result = await dispatch(forgotPassword(email));

        if (forgotPassword.fulfilled.match(result)) {
            toast.success('Reset link sent to your email!');
            setEmailSent(true);
        } else {
            toast.error((result.payload as string) || 'Failed to send reset link');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4 sm:p-6">
            <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-xl overflow-hidden animate-fade-in">

                <div className="relative bg-primary px-6 py-9 sm:py-12 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-4 w-24 h-24 rounded-full bg-white/[.07]" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />

                    <div className="relative text-5xl mb-3 animate-bounce">
                        <HiOutlineEnvelope className="mx-auto text-white" />
                    </div>

                    <h1 className="relative text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Forgot Password
                    </h1>
                    <p className="relative text-white/80 text-sm mt-2 px-2">
                        Enter your registered email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className="p-5 sm:p-7">
                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="animate-slide-in" noValidate>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({});
                                        }}
                                        placeholder="you@university.edu"
                                        className={`
                                            w-full px-4 py-3 bg-bg border-[1.5px] rounded-xl
                                            text-base text-text font-sans outline-none
                                            placeholder:text-muted
                                            transition-all duration-150
                                            focus:border-primary focus:ring-2 focus:ring-accent/40
                                            ${errors.email ? 'border-red-500' : 'border-gray-200'}
                                        `}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full px-8 py-3.5 mt-2
                                        bg-primary text-white
                                        border-none rounded-xl text-base font-bold
                                        cursor-pointer transition-all duration-200
                                        shadow-[0_4px_18px_rgba(224,0,0,0.35)]
                                        hover:bg-secondary hover:shadow-[0_6px_24px_rgba(168,0,0,0.4)]
                                        hover:-translate-y-0.5 active:scale-[0.98]
                                        disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                                    `}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner /> Sending...
                                        </span>
                                    ) : 'Send Reset Link'}
                                </button>

                                <Link
                                    to="/auth/sign-in"
                                    className="
                                        w-full px-6 py-3 mt-1 flex items-center justify-center gap-2
                                        bg-surface text-text
                                        border-[1.5px] border-gray-200 rounded-xl
                                        text-base font-semibold cursor-pointer
                                        transition-all duration-200
                                        hover:bg-bg hover:border-accent
                                        active:scale-[0.98]
                                    "
                                >
                                    <HiArrowLeft size={18} /> Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center animate-slide-in py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-text mb-2">Check your email</h3>
                            <p className="text-muted text-sm mb-6">
                                We've sent a password reset link to <span className="font-semibold text-text">{email}</span>.
                                Please check your inbox and spam folder.
                            </p>
                            <Link
                                to="/auth/sign-in"
                                className="text-primary font-bold hover:text-secondary underline underline-offset-4 decoration-2"
                            >
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>
                <div className="h-1 bg-accent" />
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
    );
}
