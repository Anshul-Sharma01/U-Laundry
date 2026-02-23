import { Link } from 'react-router-dom';
import {
    HiClock,
    HiCheckCircle,
    HiEnvelope,
    HiMagnifyingGlass,
    HiRocketLaunch,
    HiArrowRight,
    HiShieldCheck,
} from 'react-icons/hi2';
import type { ReactNode } from 'react';
import { LOGO } from '../../constants';

// ─── Timeline data ────────────────────────────────────────────────────────────

const TIMELINE = [
    {
        icon: <HiCheckCircle size={17} />,
        title: 'Account Created',
        description: 'Your registration details have been saved securely.',
        done: true,
    },
    {
        icon: <HiEnvelope size={17} />,
        title: 'Admin Notified',
        description: 'A notification has been sent to the administrator.',
        done: true,
    },
    {
        icon: <HiMagnifyingGlass size={17} />,
        title: 'Under Review',
        description: 'The admin is verifying your student information.',
        active: true,
    },
    {
        icon: <HiRocketLaunch size={17} />,
        title: 'Access Granted',
        description: 'You can log in and start using U-Laundry.',
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VerificationPendingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-[440px] bg-surface rounded-2xl shadow-xl overflow-hidden">

                {/* ── Brand Header ── */}
                <div className="relative bg-primary px-6 py-7 text-center overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-3 w-20 h-20 rounded-full bg-white/[.07]" />
                    <div className="absolute top-1/2 left-1/4 w-36 h-36 rounded-full bg-white/5 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />

                    {/* Logo */}
                    <div className="relative flex justify-center mb-3">
                        <img src={LOGO} alt="U-Laundry Logo" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Pulsing clock icon */}
                    <div className="relative flex justify-center mb-2">
                        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
                            <HiClock size={30} className="text-white animate-pulse" />
                        </div>
                    </div>

                    <h1 className="relative text-white text-xl font-extrabold tracking-tight">
                        Verification Pending
                    </h1>
                    <p className="relative text-white/75 text-xs mt-0.5">
                        Your account is being reviewed by the admin
                    </p>
                </div>

                {/* ── Body ── */}
                <div className="px-5 py-5 flex flex-col gap-4">

                    {/* Success banner */}
                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <HiShieldCheck size={22} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-green-700 mb-0.5">Registration Successful!</p>
                            <p className="text-xs text-green-600 leading-snug m-0">
                                Your account has been created. The administrator will verify your details shortly.
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-col gap-0">
                        {TIMELINE.map((step, idx) => (
                            <TimelineStep
                                key={idx}
                                icon={step.icon}
                                title={step.title}
                                description={step.description}
                                done={step.done}
                                active={step.active}
                                isLast={idx === TIMELINE.length - 1}
                            />
                        ))}
                    </div>

                    {/* Email notice */}
                    <div className="flex items-start gap-2.5 bg-bg border border-accent/50 rounded-xl px-3.5 py-3">
                        <HiEnvelope size={17} className="text-primary shrink-0 mt-0.5" />
                        <p className="m-0 text-xs text-text leading-snug">
                            You'll receive an email at your registered address once your account is approved.
                        </p>
                    </div>

                    {/* CTA */}
                    <Link
                        to="/auth/sign-in"
                        className="
                            flex items-center justify-center gap-2
                            w-full py-3 bg-primary text-white rounded-xl
                            text-sm font-bold no-underline
                            shadow-[0_4px_18px_rgba(224,0,0,0.3)]
                            transition-all duration-200
                            hover:bg-secondary hover:-translate-y-0.5
                            active:scale-[0.98]
                        "
                    >
                        Go to Sign In <HiArrowRight size={16} />
                    </Link>
                </div>

                {/* Accent bar */}
                <div className="h-1 bg-accent" />
            </div>
        </div>
    );
}


// ─── Timeline Step ────────────────────────────────────────────────────────────

function TimelineStep({ icon, title, description, done, active, isLast }: {
    icon: ReactNode; title: string; description: string;
    done?: boolean; active?: boolean; isLast?: boolean;
}) {
    return (
        <div className="flex gap-3">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    transition-all duration-200
                    ${done
                        ? 'bg-green-100 text-green-600'
                        : active
                            ? 'bg-primary/10 text-primary border-2 border-primary ring-2 ring-primary/20'
                            : 'bg-bg text-muted border-2 border-accent/40 opacity-50'
                    }
                `}>
                    {icon}
                </div>
                {!isLast && (
                    <div className={`w-[2px] flex-1 my-1 rounded-full ${done ? 'bg-green-300' : 'bg-accent/40'}`} style={{ minHeight: '20px' }} />
                )}
            </div>

            {/* Text */}
            <div className="pb-4">
                <p className={`font-semibold text-sm m-0 ${done ? 'text-green-700' : active ? 'text-primary' : 'text-muted'}`}>
                    {title}
                </p>
                <p className={`text-xs m-0 leading-snug ${done || active ? 'text-text' : 'text-muted'}`}>
                    {description}
                </p>
            </div>
        </div>
    );
}
