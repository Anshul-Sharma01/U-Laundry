import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword, clearAuthMessages } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { HiLockClosed, HiEye, HiEyeSlash, HiCheckCircle } from 'react-icons/hi2';

export default function ResetPasswordPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { resetToken } = useParams<{ resetToken: string }>();
    const { isLoading } = useSelector((s: RootState) => s.auth);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const rules = [
        { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'letter', text: 'At least 1 letter', regex: /[A-Za-z]/ },
        { id: 'number', text: 'At least 1 number', regex: /\d/ },
        { id: 'special', text: 'At least 1 special character (@$!%*?&)', regex: /[@$!%*?&]/ },
    ];

    const isRuleValid = (regex: RegExp) => regex.test(password);
    const allRulesValid = rules.every(rule => isRuleValid(rule.regex));
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!allRulesValid) {
            toast.error('Please ensure all password rules are met');
            return;
        }

        if (!passwordsMatch) {
            toast.error('Passwords do not match');
            return;
        }

        if (!resetToken) {
            toast.error('Invalid or missing reset token');
            return;
        }

        dispatch(clearAuthMessages());
        const result = await dispatch(resetPassword({ token: resetToken, password }));

        if (resetPassword.fulfilled.match(result)) {
            toast.success('Password changed successfully! You can now log in.');
            navigate('/auth/sign-in', { replace: true });
        } else {
            toast.error((result.payload as string) || 'Failed to change password');
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
                        <HiLockClosed className="mx-auto text-white" />
                    </div>

                    <h1 className="relative text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Create New Password
                    </h1>
                    <p className="relative text-white/80 text-sm mt-2 px-2">
                        Your new password must be different from previous used passwords and follow the security rules.
                    </p>
                </div>

                <div className="p-5 sm:p-7">
                    <form onSubmit={handleSubmit} className="animate-slide-in" noValidate>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="········"
                                        className={`
                                            w-full px-4 py-3 pr-12 bg-bg border-[1.5px] rounded-xl
                                            text-base text-text font-sans outline-none
                                            placeholder:text-muted
                                            transition-all duration-150
                                            focus:border-primary focus:ring-2 focus:ring-accent/40
                                            ${password && allRulesValid ? 'border-green-500' : 'border-gray-200'}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg p-1 text-muted hover:text-text hover:scale-110 transition-all"
                                    >
                                        {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                                    </button>
                                </div>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                                    {rules.map((rule) => {
                                        const isValid = isRuleValid(rule.regex);
                                        return (
                                            <div key={rule.id} className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-muted'}`}>
                                                <HiCheckCircle className={`w-4 h-4 ${isValid ? 'text-green-500' : 'text-gray-300'}`} />
                                                <span>{rule.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="········"
                                        className={`
                                            w-full px-4 py-3 pr-12 bg-bg border-[1.5px] rounded-xl
                                            text-base text-text font-sans outline-none
                                            placeholder:text-muted
                                            transition-all duration-150
                                            focus:border-primary focus:ring-2 focus:ring-accent/40
                                            ${confirmPassword && !passwordsMatch ? 'border-red-500' : 
                                              passwordsMatch ? 'border-green-500' : 'border-gray-200'}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg p-1 text-muted hover:text-text hover:scale-110 transition-all"
                                    >
                                        {showConfirmPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                                    </button>
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !allRulesValid || !passwordsMatch}
                                className={`
                                    w-full px-8 py-3.5 mt-2
                                    bg-primary text-white
                                    border-none rounded-xl text-base font-bold
                                    cursor-pointer transition-all duration-200
                                    shadow-[0_4px_18px_rgba(224,0,0,0.35)]
                                    hover:bg-secondary hover:shadow-[0_6px_24px_rgba(168,0,0,0.4)]
                                    hover:-translate-y-0.5 active:scale-[0.98]
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
                                    disabled:bg-gray-400
                                `}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Spinner /> Updating...
                                    </span>
                                ) : 'Reset Password'}
                            </button>

                            <p className="text-center mt-2 text-sm text-muted">
                                Remember it? <Link to="/auth/sign-in" className="text-primary font-semibold hover:underline">Log in</Link>
                            </p>
                        </div>
                    </form>
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
