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
        { title: 'Pricing Rules', desc: 'Manage discounts & offers', icon: <HiCurrencyRupee size={24} />, to: '/admin/pricing', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            {/* Welcome Header */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        Manage laundry orders, verification requests, and system settings from your dashboard.
                    </p>
                </div>
            </div>

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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {statCards.map((c) => {
                            const inner = (
                                <div key={c.label} className={`bg-surface rounded-3xl border ${c.border} p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center ${c.color} group-hover:scale-110 transition-transform`}>{c.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">{c.label}</p>
                                            <p className="text-xl sm:text-2xl font-extrabold text-text">{c.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                            return c.to ? <Link key={c.label} to={c.to} className="no-underline">{inner}</Link> : <div key={c.label}>{inner}</div>;
                        })}
                    </div>

                    {/* ── Graphs Row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bar Chart — 7-Day Order Trend */}
                        <div className="lg:col-span-2 bg-surface rounded-3xl border border-accent/20 shadow-xl p-6 sm:p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                                    <div className="w-2 h-6 rounded-full bg-primary/80" />
                                    7-Day Order Trend
                                </h3>
                                <p className="text-muted text-sm">Track order volume over the past week</p>
                            </div>
                            <div className="flex items-end gap-2 sm:gap-3 h-40">
                                {stats.orders.trend.map((d) => {
                                    const maxOrders = Math.max(...stats.orders.trend.map(t => t.orders), 1);
                                    const pct = (d.orders / maxOrders) * 100;
                                    return (
                                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold text-text">{d.orders}</span>
                                            <div className="w-full rounded-t-2xl bg-primary/20 relative" style={{ height: '100%' }}>
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-gradient-to-t from-primary to-primary/80 transition-all duration-500"
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
                        <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-6 sm:p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                                    <div className="w-2 h-6 rounded-full bg-secondary/80" />
                                    Orders by Status
                                </h3>
                                <p className="text-muted text-sm">Current order distribution</p>
                            </div>
                            {stats.orders.byStatus.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-sm text-muted">No orders yet</p>
                                </div>
                            ) : (
                                <>
                                    <DonutChart data={stats.orders.byStatus} total={stats.orders.total} />
                                    <div className="flex flex-col gap-2 mt-6">
                                        {stats.orders.byStatus.map((s) => (
                                            <div key={s._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg transition-colors">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s._id] || '#9ca3af' }} />
                                                <span className="text-sm text-muted flex-1 font-medium">{s._id}</span>
                                                <span className="font-bold text-text">{s.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── User Stats Mini Chart ── */}
                    <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-6 sm:p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                                <div className="w-2 h-6 rounded-full bg-emerald-500/80" />
                                User Verification Breakdown
                            </h3>
                            <p className="text-muted text-sm">Overview of user account statuses</p>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 h-5 rounded-full bg-bg overflow-hidden flex border border-accent/10">
                                {stats.users.total > 0 && (
                                    <>
                                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(stats.users.verified / stats.users.total) * 100}%` }} title={`Verified: ${stats.users.verified}`} />
                                        <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(stats.users.pending / stats.users.total) * 100}%` }} title={`Pending: ${stats.users.pending}`} />
                                        <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(stats.users.rejected / stats.users.total) * 100}%` }} title={`Rejected: ${stats.users.rejected}`} />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                <HiCheckCircle className="text-emerald-500" size={16} /> 
                                <span className="font-bold text-text">Verified:</span>
                                <span className="font-extrabold text-emerald-600">{stats.users.verified}</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                                <HiClock className="text-amber-500" size={16} /> 
                                <span className="font-bold text-text">Pending:</span>
                                <span className="font-extrabold text-amber-600">{stats.users.pending}</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
                                <HiXCircle className="text-red-500" size={16} /> 
                                <span className="font-bold text-text">Rejected:</span>
                                <span className="font-extrabold text-red-600">{stats.users.rejected}</span>
                            </span>
                        </div>
                    </div>

                    {/* ── Recent Orders Table ── */}
                    {stats.recentOrders.length > 0 && (
                        <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl overflow-hidden">
                            <div className="px-6 sm:px-8 py-6 border-b border-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg/50 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                                        <div className="w-2 h-6 rounded-full bg-violet-500/80" />
                                        Recent Orders
                                    </h3>
                                    <p className="text-muted text-sm">Latest order activity overview</p>
                                </div>
                                <Link to="/admin/orders" className="text-sm text-primary font-semibold hover:text-secondary transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/10">
                                    View All <HiArrowTopRightOnSquare size={14} />
                                </Link>
                            </div>
                            <div className="p-6 sm:p-8 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-muted border-b border-accent/20">
                                            <th className="text-left py-3 font-bold uppercase tracking-wider text-xs">Customer</th>
                                            <th className="text-left py-3 font-bold uppercase tracking-wider text-xs">Items</th>
                                            <th className="text-left py-3 font-bold uppercase tracking-wider text-xs">Amount</th>
                                            <th className="text-left py-3 font-bold uppercase tracking-wider text-xs">Status</th>
                                            <th className="text-left py-3 font-bold uppercase tracking-wider text-xs">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders.map((o) => (
                                            <tr key={o._id} className="border-b border-accent/10 last:border-0 hover:bg-bg transition-colors">
                                                <td className="py-4 font-bold text-text">{o.user?.name || '—'}</td>
                                                <td className="py-4 text-muted font-medium">{o.totalClothes} pcs</td>
                                                <td className="py-4 font-extrabold text-text">{formatCurrency(o.moneyAmount)}</td>
                                                <td className="py-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: STATUS_COLORS[o.status] || '#9ca3af' }}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-muted font-medium">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Quick Links ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickLinks.map((l) => (
                            <Link 
                                key={l.title} 
                                to={l.to} 
                                className="group bg-surface rounded-3xl border border-accent/20 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 no-underline"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${l.bg} flex items-center justify-center ${l.color} mb-4 group-hover:scale-110 transition-transform`}>
                                    {l.icon}
                                </div>
                                <h4 className="text-base font-bold text-text flex items-center gap-2 mb-1 group-hover:text-primary transition-colors">
                                    {l.title}
                                    <HiArrowTopRightOnSquare size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted" />
                                </h4>
                                <p className="text-sm text-muted">{l.desc}</p>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}


// ═══ Donut Chart (pure SVG) ═════════════════════════════════════════════════

function DonutChart({ data, total }: { data: { _id: string; count: number }[]; total: number }) {
    const radius = 55;
    const stroke = 16;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex items-center justify-center py-4">
            <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
                {data.map((seg) => {
                    const pct = total > 0 ? seg.count / total : 0;
                    const dash = circumference * pct;
                    const gap = circumference - dash;
                    const currentOffset = offset;
                    offset += dash;
                    return (
                        <circle
                            key={seg._id}
                            cx="70" cy="70" r={radius}
                            fill="none"
                            stroke={STATUS_COLORS[seg._id] || '#9ca3af'}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-currentOffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    );
                })}
                <text x="70" y="68" textAnchor="middle" className="text-3xl font-extrabold" fill="currentColor" style={{ fontSize: 28 }}>{total}</text>
                <text x="70" y="88" textAnchor="middle" className="text-xs font-bold uppercase tracking-wider" fill="#6B7280" style={{ fontSize: 11 }}>Total</text>
            </svg>
        </div>
    );
}
