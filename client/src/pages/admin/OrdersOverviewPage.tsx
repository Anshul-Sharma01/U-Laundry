import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
    HiClipboardDocumentList, HiArrowLeft, HiChevronDown, HiChevronUp,
    HiArrowRight,
} from 'react-icons/hi2';

const STATUSES = ['All', 'Order Placed', 'Pending', 'Prepared', 'Picked Up', 'Cancelled', 'Payment left'];
const UPDATE_STATUSES = ['Order Placed', 'Pending', 'Prepared', 'Picked Up', 'Cancelled'];

const STATUS_COLORS: Record<string, string> = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'Prepared': 'bg-violet-100 text-violet-700',
    'Picked Up': 'bg-emerald-100 text-emerald-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Payment left': 'bg-gray-100 text-gray-600',
};

function formatCurrency(paisa: number): string {
    return '₹' + (paisa / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function OrdersOverviewPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, ordersCurrentPage, ordersTotalPages, ordersTotalCount, isLoading } = useSelector((s: RootState) => s.admin);
    const [activeTab, setActiveTab] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => { loadOrders(1); }, []);

    const loadOrders = (page: number) => {
        dispatch(fetchAllOrders({ page, limit: 10 }));
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // For "All", use the paginated endpoint; for specific status we just filter from loaded orders
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        const result = await dispatch(updateOrderStatus({ orderId, status: newStatus }));
        setUpdatingId(null);
        if (updateOrderStatus.fulfilled.match(result)) {
            toast.success(`Order updated to "${newStatus}"`);
        } else {
            toast.error((result.payload as string) || 'Update failed');
        }
    };

    const displayOrders = activeTab === 'All'
        ? orders
        : orders.filter(o => o.status === activeTab);

    return (
        <div className="min-h-screen bg-bg">
            {/* Header */}
            <header className="relative bg-primary text-white px-6 py-6 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />
                <div className="max-w-6xl mx-auto relative flex items-center gap-3">
                    <Link to="/admin/dashboard" className="text-white/70 hover:text-white transition-colors"><HiArrowLeft size={20} /></Link>
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Admin</p>
                        <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2"><HiClipboardDocumentList size={24} /> Orders Overview</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto pb-1">
                    {STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => handleTabChange(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap ${activeTab === s ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-accent/50 hover:border-primary'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-muted mb-3">{ordersTotalCount} total order{ordersTotalCount !== 1 ? 's' : ''} · Showing page {ordersCurrentPage} of {ordersTotalPages || 1}</p>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <HiClipboardDocumentList size={48} className="mx-auto text-muted/40 mb-3" />
                        <p className="text-sm text-muted">No orders found{activeTab !== 'All' ? ` for "${activeTab}"` : ''}.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {displayOrders.map((o) => {
                            const isExpanded = expandedId === o._id;
                            const statusClass = STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600';
                            return (
                                <div key={o._id} className="bg-surface rounded-xl border border-accent/40 overflow-hidden transition-all">
                                    {/* Row */}
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg/40 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : o._id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5">
                                                {o.user?.avatar?.secure_url && (
                                                    <img src={o.user.avatar.secure_url} alt="" className="w-8 h-8 rounded-full object-cover border border-accent/40 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-text truncate">{o.user?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 text-xs">
                                            <span className="text-muted">{o.totalClothes} items</span>
                                            <span className="font-bold text-text">{formatCurrency(o.moneyAmount)}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${statusClass}`}>{o.status}</span>
                                        {isExpanded ? <HiChevronUp size={16} className="text-muted" /> : <HiChevronDown size={16} className="text-muted" />}
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 border-t border-accent/20">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                                                <div>
                                                    <span className="text-muted block">Customer</span>
                                                    <span className="font-semibold text-text">{o.user?.name || '—'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted block">Email</span>
                                                    <span className="font-semibold text-text truncate block">{o.user?.email || '—'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted block">Hostel</span>
                                                    <span className="font-semibold text-text">{o.user?.hostelName || '—'}{o.user?.roomNumber ? `, ${o.user.roomNumber}` : ''}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted block">Payment</span>
                                                    <span className={`font-semibold ${o.moneyPaid ? 'text-emerald-600' : 'text-red-500'}`}>{o.moneyPaid ? 'Paid' : 'Unpaid'}</span>
                                                </div>
                                            </div>

                                            {o.pickupSlot?.slotDate && (
                                                <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                                                    <p className="text-[10px] text-emerald-700 font-semibold uppercase">Pickup Slot</p>
                                                    <p className="text-xs text-emerald-800 font-bold">
                                                        {new Date(`${o.pickupSlot.slotDate}T00:00:00`).toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })} ({o.pickupSlot.slotLabel})
                                                    </p>
                                                </div>
                                            )}

                                            {/* Items */}
                                            {o.items && o.items.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-[10px] text-muted font-semibold uppercase mb-1.5">Items</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {o.items.map((item, idx) => (
                                                            <span key={idx} className="px-2.5 py-1 bg-bg rounded-lg text-xs text-text border border-accent/30">
                                                                {item.laundryItem?.title || 'Item'} × {item.quantity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Update */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted font-medium">Update status:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {UPDATE_STATUSES.filter(s => s !== o.status).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusUpdate(o._id, s)}
                                                            disabled={updatingId === o._id}
                                                            className="px-2.5 py-1 bg-bg border border-accent/50 rounded-lg text-[10px] font-semibold text-text cursor-pointer hover:border-primary hover:text-primary transition-all disabled:opacity-40"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {ordersTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            onClick={() => loadOrders(ordersCurrentPage - 1)}
                            disabled={ordersCurrentPage <= 1}
                            className="px-3 py-2 bg-surface border border-accent/50 rounded-lg text-xs font-semibold text-text cursor-pointer hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <HiArrowLeft size={14} /> Prev
                        </button>
                        <span className="text-xs text-muted font-medium">Page {ordersCurrentPage} of {ordersTotalPages}</span>
                        <button
                            onClick={() => loadOrders(ordersCurrentPage + 1)}
                            disabled={ordersCurrentPage >= ordersTotalPages}
                            className="px-3 py-2 bg-surface border border-accent/50 rounded-lg text-xs font-semibold text-text cursor-pointer hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next <HiArrowRight size={14} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
