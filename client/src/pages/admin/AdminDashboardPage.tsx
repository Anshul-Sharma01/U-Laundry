import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import {
    HiUserGroup, HiShieldCheck, HiClipboardDocumentList, HiCurrencyRupee,
    HiClock, HiCheckCircle, HiXCircle, HiArrowTrendingUp,
    HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    'Order Placed': '#3b82f6',
    'Pending': '#f59e0b',
    'Prepared': '#8b5cf6',
    'Picked Up': '#10b981',
    'Cancelled': '#ef4444',
    'Payment left': '#6b7280',
};

function formatCurrency(paisa: number): string {
    return '₹' + (paisa / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((s: RootState) => s.auth);
    const { stats, statsLoading } = useSelector((s: RootState) => s.admin);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const statCards = [
        { label: 'Total Users', value: stats?.users.total ?? '—', icon: <HiUserGroup size={22} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
        { label: 'Pending Approvals', value: stats?.users.pending ?? '—', icon: <HiClock size={22} />, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', to: '/admin/pending' },
        { label: 'Total Orders', value: stats?.orders.total ?? '—', icon: <HiClipboardDocumentList size={22} />, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', to: '/admin/orders' },
        { label: 'Revenue', value: stats ? formatCurrency(stats.orders.revenue) : '—', icon: <HiCurrencyRupee size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ];

    const quickLinks = [
        { title: 'Pending Verifications', desc: 'Review student registrations', icon: <HiShieldCheck size={24} />, to: '/admin/pending', color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'Manage Users', desc: 'View and manage all users', icon: <HiUserGroup size={24} />, to: '/admin/users', color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Orders Overview', desc: 'Track and update orders', icon: <HiClipboardDocumentList size={24} />, to: '/admin/orders', color: 'text-violet-500', bg: 'bg-violet-50' },
    ];

    // ─── Render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-bg">

            {/* ── Header ── */}
            <header className="relative bg-primary text-white px-6 py-8 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-white/[.07]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />
                <div className="max-w-6xl mx-auto relative">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Admin Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome, {user?.name || 'Admin'} 👋</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

                {statsLoading && (
                    <div className="flex items-center justify-center py-12">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                )}

                {!statsLoading && stats && (
                    <>
                        {/* ── Stat Cards ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {statCards.map((c) => {
                                const inner = (
                                    <div key={c.label} className={`bg-surface rounded-xl border ${c.border} p-4 sm:p-5 transition-all hover:shadow-md group`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.color}`}>{c.icon}</div>
                                            <div>
                                                <p className="text-xs text-muted font-medium">{c.label}</p>
                                                <p className="text-xl sm:text-2xl font-extrabold text-text">{c.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                                return c.to ? <Link key={c.label} to={c.to} className="no-underline">{inner}</Link> : <div key={c.label}>{inner}</div>;
                            })}
                        </div>

                        {/* ── Graphs Row ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                            {/* Bar Chart — 7-Day Order Trend */}
                            <div className="lg:col-span-2 bg-surface rounded-xl border border-accent/40 p-5">
                                <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
                                    <HiArrowTrendingUp size={18} className="text-primary" /> 7-Day Order Trend
                                </h3>
                                <div className="flex items-end gap-2 sm:gap-3 h-40">
                                    {stats.orders.trend.map((d) => {
                                        const maxOrders = Math.max(...stats.orders.trend.map(t => t.orders), 1);
                                        const pct = (d.orders / maxOrders) * 100;
                                        return (
                                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-bold text-text">{d.orders}</span>
                                                <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: '100%' }}>
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 rounded-t-md bg-primary transition-all duration-500"
                                                        style={{ height: `${Math.max(pct, 4)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted font-medium">{d.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Donut Chart — Orders by Status */}
                            <div className="bg-surface rounded-xl border border-accent/40 p-5">
                                <h3 className="text-sm font-bold text-text mb-4">Orders by Status</h3>
                                {stats.orders.byStatus.length === 0 ? (
                                    <p className="text-sm text-muted text-center py-8">No orders yet</p>
                                ) : (
                                    <>
                                        <DonutChart data={stats.orders.byStatus} total={stats.orders.total} />
                                        <div className="flex flex-col gap-1.5 mt-4">
                                            {stats.orders.byStatus.map((s) => (
                                                <div key={s._id} className="flex items-center gap-2 text-xs">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s._id] || '#9ca3af' }} />
                                                    <span className="text-muted flex-1">{s._id}</span>
                                                    <span className="font-bold text-text">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── User Stats Mini Chart ── */}
                        <div className="bg-surface rounded-xl border border-accent/40 p-5">
                            <h3 className="text-sm font-bold text-text mb-3">User Verification Breakdown</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-4 rounded-full bg-bg overflow-hidden flex">
                                    {stats.users.total > 0 && (
                                        <>
                                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(stats.users.verified / stats.users.total) * 100}%` }} title={`Verified: ${stats.users.verified}`} />
                                            <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(stats.users.pending / stats.users.total) * 100}%` }} title={`Pending: ${stats.users.pending}`} />
                                            <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(stats.users.rejected / stats.users.total) * 100}%` }} title={`Rejected: ${stats.users.rejected}`} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1.5"><HiCheckCircle className="text-emerald-500" size={14} /> Verified: {stats.users.verified}</span>
                                <span className="flex items-center gap-1.5"><HiClock className="text-amber-400" size={14} /> Pending: {stats.users.pending}</span>
                                <span className="flex items-center gap-1.5"><HiXCircle className="text-red-400" size={14} /> Rejected: {stats.users.rejected}</span>
                            </div>
                        </div>

                        {/* ── Recent Orders Table ── */}
                        {stats.recentOrders.length > 0 && (
                            <div className="bg-surface rounded-xl border border-accent/40 p-5 overflow-x-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-text">Recent Orders</h3>
                                    <Link to="/admin/orders" className="text-xs text-primary font-semibold hover:text-secondary transition-colors flex items-center gap-1">
                                        View All <HiArrowTopRightOnSquare size={12} />
                                    </Link>
                                </div>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-muted border-b border-accent/30">
                                            <th className="text-left py-2 font-semibold">Customer</th>
                                            <th className="text-left py-2 font-semibold">Items</th>
                                            <th className="text-left py-2 font-semibold">Amount</th>
                                            <th className="text-left py-2 font-semibold">Status</th>
                                            <th className="text-left py-2 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders.map((o) => (
                                            <tr key={o._id} className="border-b border-accent/20 last:border-0">
                                                <td className="py-2.5 font-medium text-text">{o.user?.name || '—'}</td>
                                                <td className="py-2.5 text-muted">{o.totalClothes} pcs</td>
                                                <td className="py-2.5 font-semibold text-text">{formatCurrency(o.moneyAmount)}</td>
                                                <td className="py-2.5">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: STATUS_COLORS[o.status] || '#9ca3af' }}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Quick Links ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{quickLinks.map((l) => (
                            <Link key={l.title} to={l.to} className="group bg-surface rounded-xl border border-accent/40 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 no-underline">
                                <div className={`w-10 h-10 rounded-lg ${l.bg} flex items-center justify-center ${l.color} mb-2`}>{l.icon}</div>
                                <h4 className="text-sm font-bold text-text flex items-center gap-1">
                                    {l.title}
                                    <HiArrowTopRightOnSquare size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted" />
                                </h4>
                                <p className="text-xs text-muted mt-0.5">{l.desc}</p>
                            </Link>
                        ))}</div>
                    </>
                )}
            </main>
        </div>
    );
}


// ═══ Donut Chart (pure SVG) ═════════════════════════════════════════════════

function DonutChart({ data, total }: { data: { _id: string; count: number }[]; total: number }) {
    const radius = 50;
    const stroke = 14;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex items-center justify-center">
            <svg width="130" height="130" viewBox="0 0 130 130">
                {data.map((seg) => {
                    const pct = total > 0 ? seg.count / total : 0;
                    const dash = circumference * pct;
                    const gap = circumference - dash;
                    const currentOffset = offset;
                    offset += dash;
                    return (
                        <circle
                            key={seg._id}
                            cx="65" cy="65" r={radius}
                            fill="none"
                            stroke={STATUS_COLORS[seg._id] || '#9ca3af'}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-currentOffset}
                            strokeLinecap="butt"
                            className="transition-all duration-500"
                        />
                    );
                })}
                <text x="65" y="62" textAnchor="middle" className="text-2xl font-extrabold" fill="currentColor" style={{ fontSize: 22 }}>{total}</text>
                <text x="65" y="78" textAnchor="middle" className="text-xs" fill="#9ca3af" style={{ fontSize: 10 }}>orders</text>
            </svg>
        </div>
    );
}
