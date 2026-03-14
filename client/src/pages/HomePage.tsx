import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
    HiClock, HiOutlinePlus, 
    HiOutlineMinus, HiOutlineShoppingCart, HiOutlineReceiptRefund 
} from 'react-icons/hi2';
import axiosInstance from '../helpers/axiosInstance';
import toast from 'react-hot-toast';

interface LaundryItem {
    _id: string;
    title: string;
    image: { secure_url: string };
    pricePerUnit: number;
    category: string;
    isActive: boolean;
    maxQuantityPerOrder: number;
}

interface Order {
    _id: string;
    items: { laundryItem: LaundryItem, quantity: number }[];
    totalClothes: number;
    moneyAmount: number;
    status: string;
    createdAt: string;
}

export default function HomePage() {
    const { user } = useSelector((s: RootState) => s.auth);
    
    const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const fetchLaundryItems = async () => {
        try {
            setLoadingItems(true);
            const { data } = await axiosInstance.get('/laundry-items');
            if (data?.data) {
                // Filter active items (fallback, though endpoints should return active only)
                setLaundryItems(data.data.filter((item: LaundryItem) => item.isActive));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch items');
        } finally {
            setLoadingItems(false);
        }
    };

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

    useEffect(() => {
        if (user?._id) {
            fetchLaundryItems();
            fetchOrders();
        }
    }, [user?._id]);

    const handleQuantityChange = (itemId: string, delta: number, maxQty: number) => {
        setCart(prev => {
            const current = prev[itemId] || 0;
            const next = current + delta;
            if (next < 0) return prev;
            if (next > maxQty) {
                toast.error(`Maximum allowed is ${maxQty}`);
                return prev;
            }
            const updated = { ...prev, [itemId]: next };
            if (next === 0) delete updated[itemId];
            return updated;
        });
    };

    const handlePlaceOrder = async () => {
        const itemsPayload = Object.entries(cart).map(([laundryItem, quantity]) => ({
            laundryItem,
            quantity
        }));

        if (itemsPayload.length === 0) {
            return toast.error("Please add at least one item to cart");
        }

        try {
            setIsPlacingOrder(true);
            const { data } = await axiosInstance.post('/orders/add', { items: itemsPayload });
            toast.success("Order Placed Successfully!");
            setCart({});
            fetchOrders(); // Refresh order history
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

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

    const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalCartPrice = Object.entries(cart).reduce((total, [id, qty]) => {
        const item = laundryItems.find(i => i._id === id);
        return total + (item?.pricePerUnit || 0) * qty;
    }, 0);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">

            {/* Welcome Header */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        Schedule new pickups, track your laundry, and stay updated with your order history in one place.
                    </p>
                </div>
            </div>

            {/* Quick Place Order Section */}
            <div className="bg-surface rounded-[2.5rem] shadow-xl border border-accent/20 overflow-hidden">
                <div className="px-6 sm:px-8 py-6 border-b border-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg/50 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <div className="w-2 h-6 rounded-full bg-primary/80" />
                            Quick Place Order
                        </h2>
                        <p className="text-muted text-sm mt-1">Select items and quantities to place a new laundry order.</p>
                    </div>
                    {totalCartItems > 0 && (
                        <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                            <span className="font-bold text-primary">₹{totalCartPrice.toFixed(2)}</span>
                            <div className="w-px h-4 bg-primary/20" />
                            <span className="text-sm font-semibold text-primary/80">{totalCartItems} Items</span>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8">
                    {loadingItems ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="h-[280px] rounded-[2rem] bg-accent/10 animate-pulse" />
                            ))}
                        </div>
                    ) : laundryItems.length === 0 ? (
                        <div className="text-center py-10">
                            <HiOutlineShoppingCart className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-text/70">No Laundry Items Available</h3>
                            <p className="text-muted text-sm">Please check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {laundryItems.map(item => {
                                const qty = cart[item._id] || 0;
                                return (
                                    <div key={item._id} className="bg-bg rounded-[2rem] p-4 sm:p-5 border border-accent/10 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                        <div className="aspect-square rounded-[1.5rem] bg-surface mb-4 overflow-hidden relative border border-accent/5 hidden sm:block">
                                            {item.image?.secure_url ? (
                                                <img 
                                                    src={item.image.secure_url} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-accent/5">
                                                    <HiOutlineShoppingCart className="w-8 h-8 text-muted/30" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                                <span className="text-sm font-extrabold text-primary">₹{item.pricePerUnit}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Mobile view top part without big image */}
                                        <div className="sm:hidden flex justify-between items-start mb-4">
                                            <span className="text-sm font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">₹{item.pricePerUnit}</span>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-text leading-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                                <span className="text-xs font-bold text-muted uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md inline-block mb-4">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto bg-surface p-1.5 rounded-2xl border border-accent/10">
                                                <button 
                                                    onClick={() => handleQuantityChange(item._id, -1, item.maxQuantityPerOrder)}
                                                    className={`p-2.5 rounded-xl transition-all ${qty > 0 ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-primary/30' : 'text-muted/50 cursor-not-allowed'}`}
                                                    disabled={qty === 0}
                                                >
                                                    <HiOutlineMinus className="w-5 h-5" />
                                                </button>
                                                <span className="font-extrabold text-xl w-10 text-center">{qty}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(item._id, 1, item.maxQuantityPerOrder)}
                                                    className={`p-2.5 rounded-xl transition-all ${qty < item.maxQuantityPerOrder ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-primary/30' : 'text-muted/50 cursor-not-allowed'}`}
                                                    disabled={qty === item.maxQuantityPerOrder}
                                                >
                                                    <HiOutlinePlus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Place Order CTA */}
                    <div className="mt-10 pt-8 border-t border-accent/20 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-center sm:text-left">
                           <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Total Amount</p>
                           <p className="text-3xl font-extrabold text-text">₹{totalCartPrice.toFixed(2)}</p>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={totalCartItems === 0 || isPlacingOrder}
                            className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-300 shadow-xl w-full sm:w-auto justify-center ${
                                totalCartItems > 0 && !isPlacingOrder 
                                ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/30 hover:-translate-y-1' 
                                : 'bg-surface text-muted cursor-not-allowed border border-accent/20'
                            }`}
                        >
                            {isPlacingOrder ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Place Order Securely
                                    <span className="bg-white/20 px-2.5 py-1 rounded-full text-sm ml-2">{totalCartItems} Items</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Order History Section */}
            <div className="bg-surface rounded-[2.5rem] shadow-xl border border-accent/20 overflow-hidden mb-12">
                <div className="px-6 sm:px-8 py-6 border-b border-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg/50 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <div className="w-2 h-6 rounded-full bg-secondary/80" />
                            Your Order History
                        </h2>
                        <p className="text-muted text-sm mt-1">Track and review all your recent laundry requests.</p>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {loadingOrders ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-24 rounded-[1.5rem] bg-accent/10 animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <HiOutlineReceiptRefund className="w-20 h-20 text-muted/20 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-text/70 mb-2">No Orders Yet</h3>
                            <p className="text-muted text-sm max-w-sm mx-auto">When you place your first laundry order, it will appear here for easy tracking.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {orders.map(order => (
                                <div key={order._id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-[1.5rem] hover:bg-bg transition-colors border border-accent/10 hover:border-primary/30 group">
                                    
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
                                        </div>
                                    </div>

                                    <div className="flex -space-x-3 overflow-hidden ml-auto">
                                        {order.items.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className="w-12 h-12 rounded-full border-[3px] border-surface bg-accent/10 overflow-hidden relative shadow-sm" title={`${item.quantity}x ${item.laundryItem?.title || 'Unknown'}`}>
                                                {item.laundryItem?.image?.secure_url ? (
                                                    <img src={item.laundryItem.image.secure_url} alt="item" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text bg-bg">
                                                        x{item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-12 h-12 rounded-full border-[3px] border-surface bg-bg flex items-center justify-center relative z-10 text-xs font-bold text-muted shadow-sm">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
