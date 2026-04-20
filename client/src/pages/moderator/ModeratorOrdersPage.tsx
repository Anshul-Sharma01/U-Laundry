import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { 
    HiClock, HiUser, HiMapPin, HiCurrencyRupee, 
    HiCheckCircle, HiXCircle, HiChevronDown, HiChevronUp,
    HiMagnifyingGlass, HiFunnel
} from 'react-icons/hi2';
import { updateModeratorOrderStatus } from '../../store/slices/moderatorSlice';
import axiosInstance from '../../helpers/axiosInstance';
import toast from 'react-hot-toast';
import socketService from '../../helpers/socketService';

interface OrderItem {
    laundryItem: {
        _id: string;
        title: string;
        image?: { secure_url: string };
        pricePerUnit: number;
        category?: string;
    };
    quantity: number;
}

interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        hostelName?: string;
        roomNumber?: string;
    };
    items: OrderItem[];
    totalClothes: number;
    moneyAmount: number;
    status: string;
    moneyPaid: boolean;
    createdAt: string;
    updatedAt: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    pickupSlot?: {
        slotDate: string;
        slotLabel: string;
        selectedAt?: string;
    };
}

const VALID_STATUSES = ['Payment left', 'Order Placed', 'Pending', 'Prepared', 'Picked Up', 'Cancelled'];

export default function ModeratorOrdersPage() {
    const dispatch = useDispatch<AppDispatch>();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus]);

    // ── Real-time: listen for new orders and status changes ───────────────
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        // A new confirmed order arrived — refresh the list
        const handleNewOrder = (payload: { orderId: string; status: string }) => {
            toast(`New order received! #${payload.orderId.slice(-6).toUpperCase()}`, {
                icon: '🧺',
                duration: 4000,
            });
            fetchOrders();
        };

        // A status was updated (e.g. by another moderator tab) — patch in place
        const handleStatusUpdated = (payload: { orderId: string; status: string }) => {
            setOrders(prev =>
                prev.map(order =>
                    order._id === payload.orderId
                        ? { ...order, status: payload.status }
                        : order
                )
            );
        };

        socket.on("order:new", handleNewOrder);
        socket.on("order:statusUpdated", handleStatusUpdated);

        return () => {
            socket.off("order:new", handleNewOrder);
            socket.off("order:statusUpdated", handleStatusUpdated);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let endpoint = '/order/getall';
            if (selectedStatus !== 'all' && VALID_STATUSES.includes(selectedStatus)) {
                endpoint = `/order/get/${selectedStatus}`;
            }
            
            const { data } = await axiosInstance.get(endpoint);
            if (data?.data?.orders) {
                setOrders(data.data.orders);
            } else if (Array.isArray(data?.data)) {
                setOrders(data.data);
            } else {
                setOrders([]);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (updatingOrderId === orderId) return;
        
        setUpdatingOrderId(orderId);
        try {
            await dispatch(updateModeratorOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success(`Order status updated to "${newStatus}"`);
            // Refresh orders to get updated data
            await fetchOrders();
        } catch (error: any) {
            toast.error(error || 'Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Picked Up':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'Prepared':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Order Placed':
            case 'Pending':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Payment left':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'Cancelled':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR',
            minimumFractionDigits: 0 
        }).format(amount / 100);
    };

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            order._id.toLowerCase().includes(query) ||
            order.user.name.toLowerCase().includes(query) ||
            order.user.email.toLowerCase().includes(query) ||
            order.user.hostelName?.toLowerCase().includes(query) ||
            order.user.roomNumber?.toLowerCase().includes(query)
        );
    });

    const statusCounts = VALID_STATUSES.reduce((acc, status) => {
        acc[status] = orders.filter(o => o.status === status).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            {/* Header */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Orders Management 📋
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        View, filter, and update order statuses. Click on any order to see details.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-surface rounded-2xl p-4 border border-accent/20 shadow-sm">
                    <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total</div>
                    <div className="text-2xl font-extrabold text-text">{orders.length}</div>
                </div>
                {VALID_STATUSES.map(status => (
                    <div 
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`bg-surface rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            selectedStatus === status ? 'border-primary shadow-md' : 'border-accent/20'
                        }`}
                    >
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1 truncate">{status}</div>
                        <div className="text-2xl font-extrabold text-text">{statusCounts[status] || 0}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-[2rem] p-6 border border-accent/20 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by order ID, name, email, hostel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-accent/20 bg-bg text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <HiFunnel className="text-muted w-5 h-5" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            {VALID_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-surface rounded-[2rem] border border-accent/20 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-accent/20 bg-bg/50">
                    <h2 className="text-xl font-bold text-text">
                        {selectedStatus === 'all' ? 'All Orders' : `${selectedStatus} Orders`} 
                        <span className="text-muted text-base font-normal ml-2">({filteredOrders.length})</span>
                    </h2>
                </div>

                <div className="divide-y divide-accent/10">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-24 bg-accent/10 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <HiClock className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-text/70 mb-2">No Orders Found</h3>
                            <p className="text-muted text-sm">
                                {searchQuery ? 'Try adjusting your search filters' : 'No orders match the selected criteria'}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                isExpanded={expandedOrderId === order._id}
                                onToggleExpand={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                onStatusUpdate={handleStatusUpdate}
                                updatingOrderId={updatingOrderId}
                                getStatusColors={getStatusColors}
                                formatCurrency={formatCurrency}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

interface OrderCardProps {
    order: Order;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onStatusUpdate: (orderId: string, status: string) => Promise<void>;
    updatingOrderId: string | null;
    getStatusColors: (status: string) => string;
    formatCurrency: (amount: number) => string;
}

function OrderCard({ 
    order, 
    isExpanded, 
    onToggleExpand, 
    onStatusUpdate, 
    updatingOrderId,
    getStatusColors,
    formatCurrency 
}: OrderCardProps) {
    const [selectedStatus, setSelectedStatus] = useState(order.status);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (newStatus === order.status) return;
        setSelectedStatus(newStatus);
        await onStatusUpdate(order._id, newStatus);
    };

    return (
        <div className="p-6 hover:bg-bg/50 transition-colors group">
            {/* Main Order Row */}
            <div className="flex items-start gap-4">
                {/* Status Indicator */}
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 ${getStatusColors(order.status)}`}>
                    <HiClock className="w-7 h-7" />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            <h3 className="text-lg font-extrabold text-text group-hover:text-primary transition-colors">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <div className="flex items-center gap-1.5 text-sm text-muted">
                                    <HiUser className="w-4 h-4" />
                                    <span className="font-semibold">{order.user.name}</span>
                                </div>
                                {(order.user.hostelName || order.user.roomNumber) && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted">
                                        <HiMapPin className="w-4 h-4" />
                                        <span>
                                            {order.user.hostelName || ''} 
                                            {order.user.hostelName && order.user.roomNumber ? ' - ' : ''}
                                            {order.user.roomNumber || ''}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-muted">
                                    <HiCurrencyRupee className="w-4 h-4" />
                                    <span className="font-bold text-primary">{formatCurrency(order.moneyAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColors(order.status)}`}>
                                {order.status}
                            </span>
                            <button
                                onClick={onToggleExpand}
                                className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-primary transition-colors"
                            >
                                {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                        <span>{order.totalClothes} item{order.totalClothes !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                        {order.moneyPaid ? (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-green-600">
                                    <HiCheckCircle className="w-3 h-3" />
                                    Paid
                                </span>
                            </>
                        ) : (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-yellow-600">
                                    <HiXCircle className="w-3 h-3" />
                                    Payment Pending
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-accent/20 space-y-6">
                    {/* Order Items */}
                    <div>
                        <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Order Items</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-bg rounded-xl border border-accent/10">
                                    {item.laundryItem.image?.secure_url ? (
                                        <img 
                                            src={item.laundryItem.image.secure_url} 
                                            alt={item.laundryItem.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                            <HiClock className="w-6 h-6 text-muted/50" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-text truncate">{item.laundryItem.title}</div>
                                        <div className="text-sm text-muted">
                                            {item.quantity} × {formatCurrency(item.laundryItem.pricePerUnit)}
                                        </div>
                                    </div>
                                    <div className="font-bold text-primary">
                                        {formatCurrency(item.laundryItem.pricePerUnit * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-bg rounded-xl border border-accent/10">
                            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Customer Details</h4>
                            <div className="space-y-1 text-sm">
                                <div><span className="text-muted">Name:</span> <span className="font-semibold text-text">{order.user.name}</span></div>
                                <div><span className="text-muted">Email:</span> <span className="font-semibold text-text">{order.user.email}</span></div>
                                {order.user.hostelName && (
                                    <div><span className="text-muted">Hostel:</span> <span className="font-semibold text-text">{order.user.hostelName}</span></div>
                                )}
                                {order.user.roomNumber && (
                                    <div><span className="text-muted">Room:</span> <span className="font-semibold text-text">{order.user.roomNumber}</span></div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-bg rounded-xl border border-accent/10">
                            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Order Summary</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Items:</span>
                                    <span className="font-semibold text-text">{order.totalClothes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Subtotal:</span>
                                    <span className="font-semibold text-text">{formatCurrency(order.moneyAmount)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-accent/10">
                                    <span className="text-muted font-bold">Total:</span>
                                    <span className="font-extrabold text-primary text-lg">{formatCurrency(order.moneyAmount)}</span>
                                </div>
                                {order.razorpayPaymentId && (
                                    <div className="pt-2 border-t border-accent/10">
                                        <div className="text-xs text-muted">Payment ID:</div>
                                        <div className="text-xs font-mono text-text break-all">{order.razorpayPaymentId}</div>
                                    </div>
                                )}
                                {order.pickupSlot?.slotDate && (
                                    <div className="pt-2 border-t border-accent/10">
                                        <div className="text-xs text-muted">Pickup Slot:</div>
                                        <div className="text-xs font-semibold text-emerald-700">
                                            {new Date(`${order.pickupSlot.slotDate}T00:00:00`).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                            })} ({order.pickupSlot.slotLabel})
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Update Status</h4>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                disabled={updatingOrderId === order._id}
                                className="flex-1 px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {VALID_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {updatingOrderId === order._id && (
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
