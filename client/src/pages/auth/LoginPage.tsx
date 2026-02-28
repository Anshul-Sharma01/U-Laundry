import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, verifyOtp, resendOtp, clearAuthMessages, resetOtpState } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { HiLockClosed, HiEye, HiEyeSlash, HiArrowLeft, HiShieldCheck } from 'react-icons/hi2';
import { LOGO } from '../../constants';

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, isLoading, otpSent } = useSelector((s: RootState) => s.auth);

    useEffect(() => {
        if (isLoggedIn) {
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isLoggedIn, navigate, location.state]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Credential Submit ──

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        dispatch(clearAuthMessages());
        const result = await dispatch(loginUser({ email, password }));

        if (loginUser.fulfilled.match(result)) {
            toast.success('OTP sent to your email!');
            startResendTimer();
        } else {
            const payload = result.payload as any;
            const msg = typeof payload === 'string' ? payload : payload?.message || 'Login failed';
            toast.error(msg);
        }
    };

    // ── OTP Input Handling ──

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otpDigits];
        updated[index] = value.slice(-1);
        setOtpDigits(updated);

        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const digits = pasted.split('');
        const updated = [...otpDigits];
        digits.forEach((d, i) => { updated[i] = d; });
        setOtpDigits(updated);
    };

    // ── OTP Verify ──

    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        const code = otpDigits.join('');
        if (code.length < 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        dispatch(clearAuthMessages());
        const result = await dispatch(verifyOtp({ email, verifyCode: code }));

        if (verifyOtp.fulfilled.match(result)) {
            toast.success('Login successful!');
            navigate('/');
        } else {
            toast.error((result.payload as string) || 'Invalid OTP');
            setOtpDigits(['', '', '', '', '', '']);
        }
    };

    // ── Resend OTP ──

    const startResendTimer = () => {
        setResendTimer(120);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        const result = await dispatch(resendOtp(email));
        if (resendOtp.fulfilled.match(result)) {
            toast.success('New OTP sent!');
            startResendTimer();
        } else {
            toast.error((result.payload as string) || 'Failed to resend');
        }
    };

    const handleBack = () => {
        dispatch(resetOtpState());
        setOtpDigits(['', '', '', '', '', '']);
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        /* Page wrapper — uses bg token for the light-blue tinted background */
        <div className="min-h-screen flex items-center justify-center bg-bg p-4 sm:p-6">

            {/*
             * Card
             * - bg-surface  → pure white  (from themes.css)
             * - max-w tweaked for better mobile feel
             */}
            <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-xl overflow-hidden animate-fade-in">

                {/* ══ Gradient Header ══
                 *   bg-primary  → brand red
                 *   Decorative blobs stay white/transparent — no token needed
                 */}
                <div className="relative bg-primary px-6 py-9 sm:py-12 text-center overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-4 w-24 h-24 rounded-full bg-white/[.07]" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2" />

                    {/* Accent strip at bottom of header using the light-blue accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />

                    {otpSent && (
                        <div className="relative text-5xl mb-3 animate-bounce"><HiLockClosed className="mx-auto text-white" /></div>
                    )}

                    <h1 className="relative text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {otpSent ? 'Verify Identity' : 'Welcome Back'}
                    </h1>
                    <p className="relative text-white/80 text-sm mt-2 px-2">
                        {otpSent
                            ? `Enter the 6-digit code sent to ${email}`
                            : 'Sign in to your U-Laundry account'}
                    </p>
                </div>

                {/* ══ Form body ══ */}
                <div className="p-5 sm:p-7">

                    {!otpSent ? (
                        /* ── Credentials Phase ── */
                        <form onSubmit={handleLogin} className="animate-slide-in" noValidate>
                            <div className="flex flex-col gap-4">

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-text mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(p => ({ ...p, email: '' }));
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

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-text mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors(p => ({ ...p, password: '' }));
                                            }}
                                            placeholder="Enter your password"
                                            className={`
                                                w-full px-4 py-3 pr-12 bg-bg border-[1.5px] rounded-xl
                                                text-base text-text font-sans outline-none
                                                placeholder:text-muted
                                                transition-all duration-150
                                                focus:border-primary focus:ring-2 focus:ring-accent/40
                                                ${errors.password ? 'border-red-500' : 'border-gray-200'}
                                            `}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg p-1 text-muted hover:text-text hover:scale-110 transition-all"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                                    )}
                                </div>

                                {/* Forgot password */}
                                <div className="text-right -mt-1">
                                    <Link
                                        to="/auth/forgot-password"
                                        className="text-sm text-secondary font-semibold hover:text-primary transition-colors underline underline-offset-2"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full px-8 py-3.5 mt-1
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
                                            <Spinner /> Signing In...
                                        </span>
                                    ) : 'Sign In'}
                                </button>
                            </div>
                        </form>

                    ) : (
                        /* ── OTP Phase ── */
                        <form onSubmit={handleVerifyOtp} className="animate-slide-in">
                            <div className="flex flex-col gap-5">

                                {/* OTP digit inputs */}
                                <div
                                    className="flex justify-center gap-2 sm:gap-3"
                                    onPaste={handleOtpPaste}
                                >
                                    {otpDigits.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`
                                                w-11 h-13 sm:w-12 sm:h-14
                                                text-center text-2xl font-bold
                                                border-2 rounded-xl outline-none font-sans
                                                transition-all duration-200
                                                focus:border-primary focus:ring-2 focus:ring-accent/40 focus:scale-105
                                                ${digit
                                                    ? 'border-primary bg-accent/10 text-text'
                                                    : 'border-gray-200 bg-bg text-text'}
                                            `}
                                        />
                                    ))}
                                </div>

                                {/* Resend timer / button */}
                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <p className="text-sm text-muted">
                                            Resend code in{' '}
                                            <span className="font-bold text-primary">
                                                {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                                            </span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isLoading}
                                            className="bg-transparent border-none cursor-pointer text-secondary font-semibold text-sm font-sans hover:text-primary transition-colors underline underline-offset-2 disabled:opacity-50"
                                        >
                                            Resend Code
                                        </button>
                                    )}
                                </div>

                                {/* Verify button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full px-8 py-3.5
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
                                            <Spinner /> Verifying...
                                        </span>
                                    ) : 'Verify & Sign In'}
                                </button>

                                {/* Back button */}
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="
                                        w-full px-6 py-3
                                        bg-surface text-text
                                        border-[1.5px] border-gray-200 rounded-xl
                                        text-base font-semibold cursor-pointer
                                        transition-all duration-200
                                        hover:bg-bg hover:border-accent
                                        active:scale-[0.98]
                                    "
                                >
                                    <span className="flex items-center justify-center gap-2"><HiArrowLeft size={18} /> Back to Login</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Footer sign-up link ── */}
                    {!otpSent && (
                        <p className="text-center mt-6 text-sm text-muted">
                            Don't have an account?{' '}
                            <Link
                                to="/auth/sign-up"
                                className="text-primary font-semibold hover:text-secondary transition-colors underline underline-offset-2"
                            >
                                Sign Up
                            </Link>
                        </p>
                    )}
                </div>

                {/* ── Thin accent footer bar ── */}
                <div className="h-1 bg-accent" />
            </div>
        </div>
    );
}


// ═══ Sub-components ═════════════════════════════════════════════════════════

function Spinner() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin">
            <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3"
                fill="none" strokeDasharray="31.4 31.4"
                strokeLinecap="round"
            />
        </svg>
    );
}