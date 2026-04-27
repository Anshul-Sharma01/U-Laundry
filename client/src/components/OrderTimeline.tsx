import { useEffect, useState } from 'react';
import {
    HiCreditCard,
    HiClipboardDocumentCheck,
    HiClock,
    HiWrenchScrewdriver,
    HiCheckBadge,
    HiXCircle,
} from 'react-icons/hi2';

// ─── Status pipeline (in logical order) ─────────────────────────────────────
const TIMELINE_STEPS = [
    {
        status: 'Payment left',
        label: 'Payment',
        description: 'Awaiting payment confirmation',
        icon: HiCreditCard,
        activeColor: 'text-amber-600',
        activeBg: 'bg-amber-100 border-amber-300',
        activeRing: 'ring-amber-200',
        lineDone: 'from-amber-400 to-blue-400',
    },
    {
        status: 'Order Placed',
        label: 'Order Placed',
        description: 'Payment verified, order confirmed',
        icon: HiClipboardDocumentCheck,
        activeColor: 'text-blue-600',
        activeBg: 'bg-blue-100 border-blue-300',
        activeRing: 'ring-blue-200',
        lineDone: 'from-blue-400 to-indigo-400',
    },
    {
        status: 'Pending',
        label: 'Processing',
        description: 'Laundry is being processed',
        icon: HiClock,
        activeColor: 'text-indigo-600',
        activeBg: 'bg-indigo-100 border-indigo-300',
        activeRing: 'ring-indigo-200',
        lineDone: 'from-indigo-400 to-violet-400',
    },
    {
        status: 'Prepared',
        label: 'Prepared',
        description: 'Ready for pickup or delivery',
        icon: HiWrenchScrewdriver,
        activeColor: 'text-violet-600',
        activeBg: 'bg-violet-100 border-violet-300',
        activeRing: 'ring-violet-200',
        lineDone: 'from-violet-400 to-emerald-400',
    },
    {
        status: 'Picked Up',
        label: 'Picked Up',
        description: 'Clothes collected successfully',
        icon: HiCheckBadge,
        activeColor: 'text-emerald-600',
        activeBg: 'bg-emerald-100 border-emerald-300',
        activeRing: 'ring-emerald-200',
        lineDone: '',
    },
];

interface OrderTimelineProps {
    /** Current order status */
    currentStatus: string;
    /** ISO date of order creation */
    createdAt: string;
    /** ISO date of last update */
    updatedAt?: string;
    /** Whether the component is compact (inline in card) */
    compact?: boolean;
}

export default function OrderTimeline({
    currentStatus,
    createdAt,
    updatedAt,
    compact = false,
}: OrderTimelineProps) {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setAnimateIn(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const isCancelled = currentStatus === 'Cancelled';

    // Find current step index in the pipeline
    const currentIndex = TIMELINE_STEPS.findIndex(
        (s) => s.status === currentStatus
    );

    // For cancelled orders we show how far the order got before cancellation
    // We treat it as if all steps before the cancel point are done, then show a
    // red "Cancelled" terminator. Since we don't store *which* status it was at
    // before cancel, we show it after "Order Placed" (the minimum confirmed state).
    const effectiveIndex = isCancelled ? 1 : currentIndex;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <div
            className={`relative ${compact ? 'py-2' : 'py-4'}`}
            role="list"
            aria-label="Order progress timeline"
        >
            {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < effectiveIndex;
                const isCurrent = idx === effectiveIndex && !isCancelled;
                const isFuture = idx > effectiveIndex;

                const Icon = step.icon;

                // Determine visual state
                let nodeClasses: string;
                let iconClasses: string;
                let labelClasses: string;
                let descClasses: string;

                if (isCompleted) {
                    nodeClasses = `${step.activeBg} border-2 shadow-sm`;
                    iconClasses = step.activeColor;
                    labelClasses = 'text-text font-bold';
                    descClasses = 'text-muted';
                } else if (isCurrent) {
                    nodeClasses = `${step.activeBg} border-2 shadow-lg ring-4 ${step.activeRing}`;
                    iconClasses = step.activeColor;
                    labelClasses = 'text-text font-extrabold';
                    descClasses = 'text-text/70 font-medium';
                } else {
                    nodeClasses =
                        'bg-gray-50 border-2 border-gray-200';
                    iconClasses = 'text-gray-300';
                    labelClasses = 'text-gray-400 font-semibold';
                    descClasses = 'text-gray-300';
                }

                // Connector line between steps
                const showConnector = idx < TIMELINE_STEPS.length - 1;
                const connectorDone = idx < effectiveIndex;

                return (
                    <div
                        key={step.status}
                        className="relative flex items-start gap-4"
                        role="listitem"
                        aria-current={isCurrent ? 'step' : undefined}
                        style={{
                            opacity: animateIn ? 1 : 0,
                            transform: animateIn
                                ? 'translateY(0)'
                                : 'translateY(12px)',
                            transition: `opacity 0.4s ease ${idx * 0.1}s, transform 0.4s ease ${idx * 0.1}s`,
                        }}
                    >
                        {/* ── Left column: Node + Connector ── */}
                        <div className="flex flex-col items-center shrink-0">
                            {/* Circle node */}
                            <div
                                className={`relative flex items-center justify-center rounded-full transition-all duration-500
                                    ${compact ? 'w-9 h-9' : 'w-11 h-11'}
                                    ${nodeClasses}
                                    ${isCurrent ? 'animate-soft-pulse' : ''}
                                `}
                            >
                                <Icon
                                    className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${iconClasses} transition-colors duration-300`}
                                />
                                {/* Completed checkmark overlay */}
                                {isCompleted && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                        <svg
                                            className="w-2.5 h-2.5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Connector line */}
                            {showConnector && (
                                <div
                                    className={`relative ${compact ? 'h-6' : 'h-9'} w-0.5 rounded-full overflow-hidden transition-colors duration-500
                                        ${connectorDone ? 'bg-gradient-to-b ' + step.lineDone : 'bg-gray-200'}
                                    `}
                                >
                                    {/* Animated shimmer on active connector */}
                                    {isCurrent && (
                                        <div className="absolute inset-0 w-full h-full animate-shimmer-down">
                                            <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-white/60 to-transparent" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Right column: Label + Description ── */}
                        <div
                            className={`pb-${showConnector ? (compact ? '3' : '5') : '0'} min-w-0`}
                            style={{
                                paddingBottom: showConnector
                                    ? compact
                                        ? '0.75rem'
                                        : '1.25rem'
                                    : '0',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`${compact ? 'text-sm' : 'text-base'} leading-tight ${labelClasses} transition-colors duration-300`}
                                >
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span
                                        className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${step.activeBg} ${step.activeColor}`}
                                    >
                                        Current
                                    </span>
                                )}
                            </div>
                            {!compact && (
                                <p
                                    className={`text-xs mt-0.5 ${descClasses} transition-colors duration-300 ${isFuture ? 'opacity-0' : 'opacity-100'}`}
                                >
                                    {step.description}
                                </p>
                            )}
                            {/* Show date for the current step */}
                            {isCurrent && !compact && (
                                <p className="text-[0.65rem] text-muted mt-1 font-semibold">
                                    {updatedAt
                                        ? formatDate(updatedAt)
                                        : formatDate(createdAt)}
                                </p>
                            )}
                            {/* Show creation date for the first completed step */}
                            {isCompleted && idx === 0 && !compact && (
                                <p className="text-[0.65rem] text-muted mt-1">
                                    {formatDate(createdAt)}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* ── Cancelled terminator ── */}
            {isCancelled && (
                <div
                    className="relative flex items-start gap-4"
                    style={{
                        opacity: animateIn ? 1 : 0,
                        transform: animateIn
                            ? 'translateY(0)'
                            : 'translateY(12px)',
                        transition: `opacity 0.4s ease ${TIMELINE_STEPS.length * 0.1}s, transform 0.4s ease ${TIMELINE_STEPS.length * 0.1}s`,
                    }}
                >
                    <div className="flex flex-col items-center shrink-0">
                        <div
                            className={`relative flex items-center justify-center rounded-full border-2 shadow-lg ring-4 ring-red-200
                                ${compact ? 'w-9 h-9' : 'w-11 h-11'}
                                bg-red-100 border-red-400
                            `}
                        >
                            <HiXCircle
                                className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-red-600`}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`${compact ? 'text-sm' : 'text-base'} font-extrabold text-red-600 leading-tight`}
                            >
                                Cancelled
                            </span>
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                                Final
                            </span>
                        </div>
                        {!compact && (
                            <>
                                <p className="text-xs text-red-500/80 mt-0.5">
                                    This order has been cancelled
                                </p>
                                {updatedAt && (
                                    <p className="text-[0.65rem] text-muted mt-1 font-semibold">
                                        {formatDate(updatedAt)}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
