import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearAuthMessages } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
    HiUser, HiLockClosed, HiHome, HiCheck, HiCamera,
    HiClipboardDocumentList, HiExclamationTriangle, HiArrowLeft, HiArrowRight, HiPhoto,
    HiEye, HiEyeSlash,
} from 'react-icons/hi2';

// ─── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, title: 'Photo', icon: <HiCamera size={16} /> },
    { id: 2, title: 'Personal', icon: <HiUser size={16} /> },
    { id: 3, title: 'Account', icon: <HiLockClosed size={16} /> },
    { id: 4, title: 'Hostel', icon: <HiHome size={16} /> },
];

const HOSTELS = ['BOSE', 'ARYABHATTA', 'SARABHAI', 'CHANKAYA', 'TERESA', 'GARGI', 'KALPANA'];
const DEGREES = ['BCA', 'BE', 'PHARMA', 'NURS'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminRegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isLoading } = useSelector((s: RootState) => s.auth);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', fatherName: '', studentId: '', degreeName: 'BE',
        avatar: null as File | null,
        username: '', email: '', password: '', confirmPassword: '',
        hostelName: '', roomNumber: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Handlers ──

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, avatar: 'Image must be less than 5 MB' }));
            return;
        }
        setFormData(prev => ({ ...prev, avatar: file }));
        setAvatarPreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, avatar: '' }));
    };

    // ── Validation ──

    const validateStep = (step: number): boolean => {
        const e: Record<string, string> = {};

        if (step === 1) {
            if (!formData.avatar) e.avatar = 'Please upload your profile photo';
        }
        if (step === 2) {
            if (!formData.name.trim()) e.name = 'Name is required';
            if (!formData.fatherName.trim()) e.fatherName = "Father's name is required";
            if (!formData.studentId.trim()) e.studentId = 'Student ID is required';
            else if (isNaN(Number(formData.studentId))) e.studentId = 'Must be a number';
            if (!formData.degreeName) e.degreeName = 'Degree is required';
        }
        if (step === 3) {
            if (!formData.username.trim())
                e.username = 'Username is required';
            else if (formData.username.length < 10)
                e.username = 'At least 10 characters';
            if (!formData.email.trim())
                e.email = 'Email is required';
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email))
                e.email = 'Invalid email address';
            if (!formData.password)
                e.password = 'Password is required';
            else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password))
                e.password = 'Min 8 chars: letter + number + special char';
            if (formData.password !== formData.confirmPassword)
                e.confirmPassword = 'Passwords do not match';
        }
        if (step === 4) {
            if (!formData.hostelName) e.hostelName = 'Select your hostel';
            if (!formData.roomNumber.trim()) e.roomNumber = 'Room number is required';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 4)); };
    const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

    // ── Submit ──

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateStep(4)) return;
        dispatch(clearAuthMessages());
        const data = new FormData();
        data.append('name', formData.name);
        data.append('fatherName', formData.fatherName);
        data.append('studentId', formData.studentId);
        data.append('degreeName', formData.degreeName);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('hostelName', formData.hostelName);
        data.append('roomNumber', formData.roomNumber);
        data.append('role', 'admin');
        if (formData.avatar) data.append('avatar', formData.avatar);
        const result = await dispatch(registerUser(data));
        if (registerUser.fulfilled.match(result)) {
            toast.success('Admin Registration successful!');
            navigate('/auth/sign-in');
        } else {
            toast.error((result.payload as string) || 'Registration failed');
        }
    };

    // ── Password strength ──

    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { label: '', textColor: '', barColor: '', width: 'w-0' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[@$!%*?&]/.test(pwd)) score++;
        if (pwd.length >= 12) score++;
        const levels = [
            { label: 'Weak', textColor: 'text-red-500', barColor: 'bg-red-500', width: 'w-1/5' },
            { label: 'Fair', textColor: 'text-orange-500', barColor: 'bg-orange-500', width: 'w-2/5' },
            { label: 'Good', textColor: 'text-yellow-500', barColor: 'bg-yellow-500', width: 'w-3/5' },
            { label: 'Strong', textColor: 'text-secondary', barColor: 'bg-secondary', width: 'w-4/5' },
            { label: 'Excellent', textColor: 'text-green-600', barColor: 'bg-green-500', width: 'w-full' },
        ];
        return levels[Math.min(score, 4)];
    };

    const pwdStrength = getPasswordStrength(formData.password);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-[460px] bg-surface rounded-2xl shadow-xl overflow-hidden">

                {/* ── Compact Red Header ── */}
                <div className="relative bg-primary px-6 py-6 text-center overflow-hidden">
                    <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-3 w-20 h-20 rounded-full bg-white/[.07]" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />

                    <h1 className="relative text-white text-xl sm:text-2xl font-extrabold tracking-tight">
                        Create Admin Account
                    </h1>
                    <p className="relative text-white/75 text-xs mt-0.5">
                        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].title}
                    </p>
                </div>

                {/* ── Stepper ── */}
                <div className="px-5 pt-4 pb-1">
                    <div className="flex items-center justify-center">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className={`
                                        w-9 h-9 rounded-full flex items-center justify-center
                                        font-bold transition-all duration-300 text-sm
                                        ${currentStep >= step.id
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-bg text-muted border border-accent/50'}
                                        ${currentStep === step.id ? 'ring-4 ring-primary/20 scale-110' : ''}
                                    `}>
                                        {currentStep > step.id ? <HiCheck size={15} /> : step.icon}
                                    </div>
                                    <span className={`text-[10px] font-semibold transition-colors ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`w-10 sm:w-14 h-[2px] mx-1.5 mb-4 rounded-full transition-colors duration-300 ${currentStep > step.id ? 'bg-primary' : 'bg-accent/40'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="px-5 pb-5 pt-2">

                    {/* Step 1 — Profile Photo */}
                    {currentStep === 1 && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-muted text-center">Upload a clear photo so hostel staff can recognise you.</p>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    w-32 h-32 rounded-full cursor-pointer overflow-hidden
                                    border-[3px] border-dashed transition-all duration-200
                                    flex items-center justify-center group
                                    hover:border-primary hover:shadow-lg
                                    ${errors.avatar ? 'border-primary' : 'border-accent'}
                                    ${avatarPreview ? '' : 'bg-bg'}
                                `}
                                style={avatarPreview ? {
                                    backgroundImage: `url(${avatarPreview})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                } : undefined}
                            >
                                {!avatarPreview && (
                                    <div className="text-center group-hover:scale-110 transition-transform px-2">
                                        <HiPhoto className="mx-auto text-muted" size={36} />
                                        <span className="text-xs text-muted font-medium block mt-1">Tap to upload</span>
                                    </div>
                                )}
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-primary font-semibold hover:text-secondary transition-colors flex items-center gap-1"
                                >
                                    <HiCamera size={14} /> Change photo
                                </button>
                            )}

                            {errors.avatar && <p className="text-primary text-xs font-medium">{errors.avatar}</p>}

                            <p className="text-[11px] text-muted text-center">JPG, PNG or WEBP · Max 5 MB</p>
                        </div>
                    )}

                    {/* Step 2 — Personal Info */}
                    {currentStep === 2 && (
                        <div className="flex flex-col gap-3">
                            <Field label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Enter your full name" />
                            <Field label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} error={errors.fatherName} placeholder="Enter father's name" />
                            <Field label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} error={errors.studentId} placeholder="e.g. 2024001" />

                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Degree Program</label>
                                <select
                                    name="degreeName"
                                    value={formData.degreeName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-bg border-[1.5px] border-accent/60 rounded-xl text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                >
                                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Account Details */}
                    {currentStep === 3 && (
                        <div className="flex flex-col gap-3">
                            <Field label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} placeholder="At least 10 characters" />
                            <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@university.edu" />

                            {/* Password with show/hide */}
                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 chars"
                                        className={`w-full px-4 py-2.5 pr-11 bg-bg border-[1.5px] rounded-xl text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted ${errors.password ? 'border-primary' : 'border-accent/60'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-primary text-xs mt-1 font-medium">{errors.password}</p>}
                                {formData.password && (
                                    <div className="mt-1.5">
                                        <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                                            <div className={`h-full ${pwdStrength.width} ${pwdStrength.barColor} rounded-full transition-all duration-300`} />
                                        </div>
                                        <span className={`text-xs font-semibold ${pwdStrength.textColor}`}>{pwdStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password with show/hide */}
                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter password"
                                        className={`w-full px-4 py-2.5 pr-11 bg-bg border-[1.5px] rounded-xl text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted ${errors.confirmPassword ? 'border-primary' : 'border-accent/60'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-primary text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Hostel & Review */}
                    {currentStep === 4 && (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Hostel</label>
                                <select
                                    name="hostelName"
                                    value={formData.hostelName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-bg border-[1.5px] rounded-xl text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.hostelName ? 'border-primary' : 'border-accent/60'}`}
                                >
                                    <option value="">Select your hostel</option>
                                    {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                {errors.hostelName && <p className="text-primary text-xs mt-1 font-medium">{errors.hostelName}</p>}
                            </div>

                            <Field label="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleChange} error={errors.roomNumber} placeholder="e.g. A-101" />

                            {/* Compact summary */}
                            <div className="bg-bg border border-accent/60 rounded-xl p-3">
                                <h4 className="text-xs font-bold text-text mb-2 flex items-center gap-1.5">
                                    <HiClipboardDocumentList size={15} className="text-primary" /> Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                    <SummaryItem label="Name" value={formData.name} />
                                    <SummaryItem label="ID" value={formData.studentId} />
                                    <SummaryItem label="Username" value={formData.username} />
                                    <SummaryItem label="Email" value={formData.email} />
                                </div>
                            </div>

                            {/* Notice */}
                            <div className="bg-bg border border-accent/50 rounded-xl px-3 py-2.5 flex gap-2 items-start text-xs text-text">
                                <HiCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <p className="m-0 leading-snug">As an admin, your account will be immediately verified to allow immediate login.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Nav buttons ── */}
                    <div className={`flex mt-4 gap-3 ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-5 py-2.5 bg-surface text-text border-[1.5px] border-accent rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-bg hover:border-primary active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-1.5"><HiArrowLeft size={15} /> Back</span>
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-7 py-2.5 bg-primary text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all shadow-[0_4px_18px_rgba(224,0,0,0.3)] hover:bg-secondary hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-1.5">Next <HiArrowRight size={15} /></span>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-7 py-2.5 bg-primary text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all shadow-[0_4px_18px_rgba(224,0,0,0.3)] hover:bg-secondary hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? <span className="flex items-center gap-2"><Spinner /> Creating...</span>
                                    : 'Create Account'}
                            </button>
                        )}
                    </div>

                    {/* Footer link */}
                    <p className="text-center mt-4 text-xs text-muted">
                        Already have an account?{' '}
                        <Link to="/auth/sign-in" className="text-primary font-semibold hover:text-secondary transition-colors">
                            Sign In
                        </Link>
                    </p>
                </form>

                {/* Accent bar */}
                <div className="h-1 bg-accent" />
            </div>
        </div>
    );
}


// ═══ Sub-components ═════════════════════════════════════════════════════════

function Field({ label, name, value, onChange, error, placeholder, type = 'text' }: {
    label: string; name: string; value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string; placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-text mb-1.5">{label}</label>
            <input
                name={name} type={type} value={value} onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-bg border-[1.5px] rounded-xl text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted ${error ? 'border-primary' : 'border-accent/60'}`}
            />
            {error && <p className="text-primary text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted">{label}: </span>
            <span className="font-semibold text-text break-all">{value || '—'}</span>
        </div>
    );
}

function Spinner() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
    );
}
