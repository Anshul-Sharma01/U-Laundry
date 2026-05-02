import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store/store';
import {
    HiOutlineReceiptRefund,
    HiClock,
    HiChevronDown,
    HiReceiptPercent,
    HiChartBar,
    HiSparkles,
    HiCurrencyRupee,
    HiCheckBadge
} from 'react-icons/hi2';
import axiosInstance from '../helpers/axiosInstance';
import toast from 'react-hot-toast';
import OrderTimeline from '../components/OrderTimeline';

// --- Types ---
interface LaundryItem {
    _id: string;
    title: string;
    image?: { secure_url: string };
    pricePerUnit: number;
    category: string;
}

interface AppliedDiscount {
    ruleType: string;
    label: string;
    discountPercent: number;
    discountAmount: number;
}

interface Order {
    _id: string;
    items: { laundryItem: LaundryItem, quantity: number }[];
    totalClothes: number;
    moneyAmount: number;
    subtotalAmount?: number;
    appliedDiscounts?: AppliedDiscount[];
    totalDiscount?: number;
    status: string;
    createdAt: string;
    pickupSlot?: {
        slotDate: string;
        slotLabel: string;
    };
}

export default function OrdersPage() {
    const { user } = useSelector((s: RootState) => s.auth);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?._id) return;
            try {
                setLoadingOrders(true);
                const { data } = await axiosInstance.get(`/order/user/${user._id}`);
                if (data?.data?.userOrders) {
                    setOrders(data.data.userOrders);
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [user?._id]);

    // --- Computed Insights ---
    const insights = useMemo(() => {
        let totalSpent = 0;
        let totalSaved = 0;
        let totalClothes = 0;
        let completedCount = 0;
        let inProgressCount = 0;
        let cancelledCount = 0;

        const itemFrequency: Record<string, { title: string; count: number }> = {};

        orders.forEach(order => {
            // Count statuses
            if (order.status === 'Cancelled') {
                cancelledCount++;
                return; // Don't count cancelled orders towards spending
            } else if (order.status === 'Completed' || order.status === 'Picked Up') {
                completedCount++;
            } else {
                inProgressCount++;
            }

            // Only count non-cancelled items for spending/savings/items
            totalSpent += order.moneyAmount;
            totalSaved += order.totalDiscount || 0;
            totalClothes += order.totalClothes;

            order.items.forEach(item => {
                if (!itemFrequency[item.laundryItem._id]) {
                    itemFrequency[item.laundryItem._id] = {
                        title: item.laundryItem.title,
                        count: 0
                    };
                }
                itemFrequency[item.laundryItem._id].count += item.quantity;
            });
        });

        // Get Top Item
        const topItem = Object.values(itemFrequency).sort((a, b) => b.count - a.count)[0];

        return {
            totalSpent: totalSpent / 100, // Convert paisa to rupees
            totalSaved: totalSaved / 100,
            totalClothes,
            completedCount,
            inProgressCount,
            cancelledCount,
            topItem
        };
    }, [orders]);

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Picked Up':
                return 'bg-green-100 text-green-600 border-green-200';
            case 'Order Placed':
            case 'Prepared':
                return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-600 border-red-200';
            case 'Payment left':
                return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-600 border-yellow-200';
        }
    };

    const formatPickupDate = (slotDate: string) =>
        new Date(`${slotDate}T00:00:00`).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text flex items-center gap-3">
                        <div className="w-3 h-8 rounded-full bg-primary/80" />
                        My Laundry Journey
                    </h1>
                    <p className="text-muted mt-2 text-lg">
                        Analyze your spending, track progress, and review past orders.
                    </p>
                </div>
                <Link 
                    to="/" 
                    className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-secondary transition-all shadow-lg hover:shadow-primary/30"
                >
                    New Order
                </Link>
            </div>

            {/* Insights Dashboard */}
            {!loadingOrders && orders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Spending Card */}
                    <div className="bg-surface border border-accent/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <HiCurrencyRupee className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Total Spent</h3>
                        </div>
                        <p className="text-3xl font-extrabold text-text relative z-10">₹{insights.totalSpent.toFixed(2)}</p>
                    </div>

                    {/* Savings Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <HiSparkles className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-bold text-emerald-800/70 uppercase tracking-wider">Total Saved</h3>
                        </div>
                        <p className="text-3xl font-extrabold text-emerald-700 relative z-10">₹{insights.totalSaved.toFixed(2)}</p>
                    </div>

                    {/* Clothes Card */}
                    <div className="bg-surface border border-accent/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-accent/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-3 bg-accent/10 rounded-xl">
                                <HiCheckBadge className="w-6 h-6 text-accent-dark text-blue-500" />
                            </div>
                            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Items Washed</h3>
                        </div>
                        <p className="text-3xl font-extrabold text-text relative z-10">{insights.totalClothes} <span className="text-base text-muted font-semibold">pcs</span></p>
                    </div>

                    {/* Most Used Item Card */}
                    <div className="bg-surface border border-accent/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <HiChartBar className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Top Item</h3>
                        </div>
                        {insights.topItem ? (
                            <div>
                                <p className="text-xl font-extrabold text-text truncate relative z-10">{insights.topItem.title}</p>
                                <p className="text-sm text-purple-600 font-bold mt-1 relative z-10">{insights.topItem.count} washed so far</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted">No data yet</p>
                        )}
                    </div>
                </div>
            )}

            {/* Order History Section */}
            <div className="bg-surface rounded-[2.5rem] shadow-xl border border-accent/20 overflow-hidden mb-12">
                <div className="px-6 sm:px-8 py-6 border-b border-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg/50 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <div className="w-2 h-6 rounded-full bg-secondary/80" />
                            Complete Order History
                        </h2>
                        <p className="text-muted text-sm mt-1">Review all your past and current laundry requests.</p>
                    </div>
                    
                    {!loadingOrders && orders.length > 0 && (
                        <div className="flex gap-2 text-xs font-bold text-muted">
                            <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">{insights.completedCount} Done</span>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">{insights.inProgressCount} Active</span>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8 bg-gray-50/30">
                    {loadingOrders ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-28 rounded-[1.5rem] bg-accent/10 animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-accent/30">
                            <HiOutlineReceiptRefund className="w-20 h-20 text-muted/20 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-text/70 mb-2">No Orders Yet</h3>
                            <p className="text-muted text-sm max-w-sm mx-auto mb-6">Looks like you haven't placed any laundry orders yet.</p>
                            <Link to="/" className="px-6 py-3 rounded-full font-bold bg-primary text-white hover:bg-secondary transition-all shadow-lg">
                                Place Your First Order
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {orders.map(order => {
                                const isExpanded = expandedOrderId === order._id;
                                return (
                                    <div key={order._id} className={`rounded-[1.5rem] border transition-all duration-300 bg-surface ${
                                        isExpanded
                                            ? 'border-primary/30 shadow-lg'
                                            : 'border-accent/10 hover:border-primary/30 hover:shadow-md'
                                    }`}>
                                        {/* Clickable header */}
                                        <button
                                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                            className="w-full flex flex-col md:flex-row md:items-center gap-4 p-5 text-left group cursor-pointer"
                                        >
                                            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm ${getStatusColors(order.status)}`}>
                                                <HiClock className="w-7 h-7" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5 align-middle">
                                                    <h4 className="text-lg font-extrabold text-text group-hover:text-primary transition-colors truncate">
                                                        Order #{order._id.slice(-6).toUpperCase()}
                                                    </h4>
                                                    <span className={`px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest rounded-full border ${getStatusColors(order.status)} whitespace-nowrap`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-sm font-semibold text-muted flex-wrap">
                                                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                                                    <span>{order.totalClothes} Items</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                                                    <span className="text-primary font-extrabold">₹{(order.moneyAmount / 100).toFixed(2)}</span>
                                                    {order.pickupSlot?.slotDate && (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                                                            <span className="text-emerald-600 font-bold">
                                                                Pickup: {formatPickupDate(order.pickupSlot.slotDate)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 ml-auto">
                                                <div className="flex -space-x-3 overflow-hidden">
                                                    {order.items.slice(0, 4).map((item, idx) => (
                                                        <div key={idx} className="w-10 h-10 rounded-full border-2 border-surface bg-accent/10 overflow-hidden relative shadow-sm" title={`${item.quantity}x ${item.laundryItem?.title || 'Unknown'}`}>
                                                            {item.laundryItem?.image?.secure_url ? (
                                                                <img src={item.laundryItem.image.secure_url} alt="item" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text bg-bg">
                                                                    x{item.quantity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 4 && (
                                                        <div className="w-10 h-10 rounded-full border-2 border-surface bg-bg flex items-center justify-center relative z-10 text-[10px] font-bold text-muted shadow-sm">
                                                            +{order.items.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <HiChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        {/* Expandable timeline panel */}
                                        <div
                                            className="overflow-hidden transition-all duration-400 ease-in-out"
                                            style={{
                                                maxHeight: isExpanded ? '2000px' : '0px',
                                                opacity: isExpanded ? 1 : 0,
                                            }}
                                        >
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="border-t border-accent/15 pt-5">
                                                    <h5 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Order Progress</h5>
                                                    <OrderTimeline
                                                        currentStatus={order.status}
                                                        createdAt={order.createdAt}
                                                    />

                                                    {/* Discount breakdown */}
                                                    {order.appliedDiscounts && order.appliedDiscounts.length > 0 && (
                                                        <div className="mt-5 pt-4 border-t border-accent/15 bg-emerald-50/50 p-4 rounded-2xl">
                                                            <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <HiReceiptPercent className="w-4 h-4 text-emerald-600" />
                                                                Savings Applied
                                                            </h5>
                                                            <div className="space-y-2">
                                                                {order.appliedDiscounts.map((d, i) => (
                                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-text/80 font-medium">{d.label}</span>
                                                                            <span className="text-[0.6rem] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">{d.discountPercent}% OFF</span>
                                                                        </div>
                                                                        <span className="font-bold text-emerald-600">-₹{(d.discountAmount / 100).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-emerald-200/50">
                                                                    <span className="font-semibold text-muted">Subtotal</span>
                                                                    <span className="font-bold text-muted line-through">₹{((order.subtotalAmount || order.moneyAmount) / 100).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="font-bold text-emerald-700">Total Saved</span>
                                                                    <span className="font-extrabold text-emerald-700">₹{((order.totalDiscount || 0) / 100).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
