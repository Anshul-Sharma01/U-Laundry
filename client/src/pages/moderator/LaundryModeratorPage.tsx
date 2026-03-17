import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store/store';
import { HiPlusCircle, HiClipboardDocumentList, HiCurrencyRupee, HiQueueList } from 'react-icons/hi2';
import { fetchModeratorStats, updateModeratorOrderStatus } from '../../store/slices/moderatorSlice';
import AddLaundryItemModal from '../../components/moderator/AddLaundryItemModal';
import ManageLaundryItemsModal from '../../components/moderator/ManageLaundryItemsModal';
import toast from 'react-hot-toast';
import socketService from '../../helpers/socketService';

export default function LaundryModeratorPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((s: RootState) => s.auth);
    const { stats, statsLoading } = useSelector((s: RootState) => s.moderator);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchModeratorStats());
    }, [dispatch]);

    // ── Real-time: refresh stats when a new order arrives ─────────────────
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleNewOrder = () => {
            dispatch(fetchModeratorStats());
        };

        socket.on("order:new", handleNewOrder);

        return () => {
            socket.off("order:new", handleNewOrder);
        };
    }, [dispatch]);

    const formatCurrencyLocal = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <AddLaundryItemModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
            <ManageLaundryItemsModal 
                isOpen={isManageModalOpen} 
                onClose={() => setIsManageModalOpen(false)} 
            />

            {/* Welcome Header */}
            <div className="mb-10 p-8 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Moderator'}! 👋
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        Manage laundry items, view incoming orders, and track your branch's performance.
                    </p>
                </div>
            </div>

            {/* Stats/Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<HiPlusCircle className="text-blue-500" />}
                    title="Add Item"
                    value="+"
                    subtitle="New Catalog Item"
                    bgClass="bg-blue-50"
                    isAction={true}
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    icon={<HiQueueList className="text-indigo-500" />}
                    title="Manage Items"
                    value="List"
                    subtitle="View or Delete"
                    bgClass="bg-indigo-50"
                    isAction={true}
                    onClick={() => setIsManageModalOpen(true)}
                />
                <StatCard
                    icon={<HiClipboardDocumentList className="text-violet-500" />}
                    title="Active Orders"
                    value={statsLoading ? "..." : (stats?.orders.active?.toString() || "0")}
                    subtitle="Manage & View"
                    bgClass="bg-violet-50"
                    isAction={true}
                    onClick={() => navigate('/moderator/orders')}
                />
                <StatCard
                    icon={<HiCurrencyRupee className="text-emerald-500" />}
                    title="Payments"
                    value={statsLoading ? "..." : formatCurrencyLocal(stats?.orders.monthlyRevenue || 0)}
                    subtitle="Total this month"
                    bgClass="bg-emerald-50"
                />
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-surface rounded-3xl shadow-lg border border-accent/20 overflow-hidden">
                <div className="px-6 py-5 border-b border-accent/20 flex justify-between items-center bg-bg/50">
                    <h2 className="text-xl font-bold text-text">Recent Orders</h2>
                    <button className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
                        View All
                    </button>
                </div>

                <div className="p-6">
                    {statsLoading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                           <div className="h-16 bg-accent/10 rounded-2xl w-full"></div>
                           <div className="h-16 bg-accent/10 rounded-2xl w-full"></div>
                        </div>
                    ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {stats.recentOrders.map((order) => (
                                <ActivityRow 
                                    key={order._id}
                                    orderId={order._id}
                                    status={order.status} 
                                    label={`Order #${order._id.slice(-6).toUpperCase()} (${order.user?.name}) - ${order.totalClothes} items`} 
                                    time={new Date(order.createdAt).toLocaleDateString()} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted">No recent orders found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtitle, bgClass, isAction = false, onClick }: { icon: React.ReactNode, title: string, value: string, subtitle: string, bgClass: string, isAction?: boolean, onClick?: () => void }) {
    return (
        <div 
            onClick={isAction ? onClick : undefined}
            className={`bg-surface rounded-3xl p-6 shadow-lg border border-accent/20 transition-all duration-300 group ${isAction ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}`}
        >
            <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-text/70 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text">{value}</span>
                <span className="text-sm font-medium text-muted">{subtitle}</span>
            </div>
        </div>
    );
}

function ActivityRow({ orderId, status, label, time }: { orderId: string, status: string, label: string, time: string }) {
    const dispatch = useDispatch<AppDispatch>();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (!newStatus || newStatus === status) return;
        
        setIsUpdating(true);
        try {
            await dispatch(updateModeratorOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success(`Order status updated to "${newStatus}"`);
            // Refresh stats to update active orders count
            dispatch(fetchModeratorStats());
        } catch (error: any) {
            toast.error(error || 'Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    // Map backend status strings to frontend colors
    const getColors = () => {
        if (status.includes('Completed') || status.includes('Picked Up') || status === 'Delivered') return 'bg-green-100 text-green-600 border-green-200';
        if (status.includes('Prepared')) return 'bg-blue-100 text-blue-600 border-blue-200';
        if (status.includes('Progress') || status.includes('Pending') || status.includes('Order Placed')) return 'bg-orange-100 text-orange-600 border-orange-200';
        return 'bg-red-100 text-secondary border-red-200'; // Cancelled etc
    };

    const getDotColor = () => {
        if (status.includes('Completed') || status.includes('Picked Up') || status === 'Delivered') return 'bg-green-500';
        if (status.includes('Prepared')) return 'bg-blue-500';
        if (status.includes('Progress') || status.includes('Pending') || status.includes('Order Placed')) return 'bg-orange-500';
        return 'bg-secondary';
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-bg transition-colors group border border-transparent hover:border-accent/20">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getColors()}`}>
                <div className={`w-3 h-3 rounded-full ${getDotColor()}`} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors truncate">{label}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted font-medium break-keep">{time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getColors()} bg-opacity-50 border-0 break-keep`}>{status}</span>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 relative">
                {isUpdating && <span className="absolute -left-6 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>}
                <select 
                    value={status} 
                    onChange={handleStatusChange}
                    disabled={isUpdating}
                    className="text-sm font-semibold bg-bg border border-accent/20 text-text rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                >
                    <option value="Payment left">Payment left</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Pending">Pending</option>
                    <option value="Prepared">Prepared</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
        </div>
    );
}
