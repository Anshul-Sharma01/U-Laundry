import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
    HiClock, HiOutlinePlus, 
    HiOutlineMinus, HiOutlineShoppingCart, HiOutlineReceiptRefund,
    HiExclamationTriangle, HiXMark, HiCreditCard, HiCalendarDays,
    HiChevronDown, HiReceiptPercent, HiSparkles
} from 'react-icons/hi2';
import axiosInstance from '../helpers/axiosInstance';
import toast from 'react-hot-toast';
import socketService from '../helpers/socketService';
import OrderTimeline from '../components/OrderTimeline';

interface LaundryItem {
    _id: string;
    title: string;
    image: { secure_url: string };
    pricePerUnit: number;
    category: string;
    isActive: boolean;
    maxQuantityPerOrder: number;
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
    razorpayOrderId?: string;
    moneyPaid?: boolean;
    pickupSlot?: {
        slotDate: string;
        slotLabel: string;
        selectedAt?: string;
    };
}

interface DiscountPreview {
    subtotalPaisa: number;
    totalClothes: number;
    userOrderCount: number;
    discounts: AppliedDiscount[];
    totalDiscount: number;
    finalAmount: number;
}

interface PickupSlot {
    slotDate: string;
    slotLabel: string;
    capacity: number;
    bookedCount: number;
    remaining: number;
    isAvailable: boolean;
}

export default function HomePage() {
    const { user } = useSelector((s: RootState) => s.auth);
    
    const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isCompletingPayment, setIsCompletingPayment] = useState(false);
    const [isCancellingOrder, setIsCancellingOrder] = useState(false);
    const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
    const [slotOrderId, setSlotOrderId] = useState<string | null>(null);
    const [isLoadingPickupSlots, setIsLoadingPickupSlots] = useState(false);
    const [isSelectingPickupSlot, setIsSelectingPickupSlot] = useState(false);
    const [minPickupDaysAhead, setMinPickupDaysAhead] = useState(2);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [discountPreview, setDiscountPreview] = useState<DiscountPreview | null>(null);
    const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);

    // ── Pending payment order (status === 'Payment left') ────────────────
    const pendingOrder = orders.find(o => o.status === 'Payment left');

    const fetchLaundryItems = useCallback(async () => {
        try {
            setLoadingItems(true);
            const { data } = await axiosInstance.get('/laundry-items');
            if (data?.data) {
                setLaundryItems(data.data.filter((item: LaundryItem) => item.isActive));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch items');
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
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
    }, [user?._id]);

    useEffect(() => {
        if (user?._id) {
            fetchLaundryItems();
            fetchOrders();
        }
    }, [user?._id, fetchLaundryItems, fetchOrders]);

    const fetchPickupSlots = useCallback(async (orderId: string) => {
        try {
            setIsLoadingPickupSlots(true);
            const { data } = await axiosInstance.get(`/order/pickup-slots/${orderId}`);
            setPickupSlots(data?.data?.slots || []);
            setSlotOrderId(orderId);
            setMinPickupDaysAhead(data?.data?.minDaysAhead || 2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch pickup slots');
            setPickupSlots([]);
            setSlotOrderId(null);
        } finally {
            setIsLoadingPickupSlots(false);
        }
    }, []);

    // ── Real-time: listen for order status updates from the server ────────
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleStatusUpdate = (payload: { orderId: string; status: string }) => {
            setOrders(prev =>
                prev.map(order =>
                    order._id === payload.orderId
                        ? { ...order, status: payload.status }
                        : order
                )
            );
            toast.success(`Order #${payload.orderId.slice(-6).toUpperCase()} is now: ${payload.status}`, {
                icon: '🔄',
                duration: 4000,
            });
        };

        socket.on("order:statusUpdated", handleStatusUpdate);

        // Cleanup: remove listener when component unmounts or socket changes
        return () => {
            socket.off("order:statusUpdated", handleStatusUpdate);
        };
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

    // ── Open Razorpay Checkout ────────────────────────────────────────────
    const openRazorpayCheckout = useCallback((
        razorpayOrderId: string,
        keyId: string,
        amount: number,
        currency: string,
        orderId: string,
    ) => {
        if (!window.Razorpay) {
            toast.error("Payment gateway not loaded. Please refresh the page.");
            return;
        }

        const options: RazorpayOptions = {
            key: keyId,
            amount,
            currency,
            name: "U-Laundry",
            description: `Order #${orderId.slice(-6).toUpperCase()}`,
            order_id: razorpayOrderId,
            prefill: {
                name: user?.name || "",
                email: user?.email || "",
            },
            theme: {
                color: "#6366f1",
            },
            handler: async (response: RazorpayPaymentResponse) => {
                // Payment successful — verify signature on backend
                try {
                    await axiosInstance.post('/order/verify-signature', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    toast.success("Payment verified! Order placed successfully 🎉");
                    setCart({});
                    fetchOrders();
                    fetchPickupSlots(orderId);
                } catch (err: any) {
                    toast.error(err.response?.data?.message || "Payment verification failed. Contact support.");
                    fetchOrders(); // Refresh to show current state
                }
            },
            modal: {
                confirm_close: true,
                ondismiss: () => {
                    toast("Payment cancelled. You can complete it later.", { icon: "⚠️" });
                    fetchOrders(); // Refresh to show the "Payment left" order
                },
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (response: any) => {
            toast.error(
                response?.error?.description || "Payment failed. Please try again."
            );
            fetchOrders();
        });

        rzp.open();
    }, [user, fetchOrders, fetchPickupSlots]);

    // ── Place New Order ───────────────────────────────────────────────────
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
            const { data } = await axiosInstance.post('/order/add', { items: itemsPayload });
            
            const { razorpayOrderId, key_id, amount, currency, order } = data.data;

            // Open Razorpay Checkout modal
            openRazorpayCheckout(razorpayOrderId, key_id, amount, currency, order._id);

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // ── Complete Pending Payment ──────────────────────────────────────────
    const handleCompletePayment = async () => {
        if (!pendingOrder?.razorpayOrderId) {
            toast.error("Invalid pending order. Please start a new order.");
            return;
        }

        setIsCompletingPayment(true);

        try {
            // Re-open Razorpay checkout with the same order ID
            const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
            
            openRazorpayCheckout(
                pendingOrder.razorpayOrderId,
                keyId,
                pendingOrder.moneyAmount,
                "INR",
                pendingOrder._id,
            );
        } catch (error: any) {
            // If the Razorpay order expired, show error + auto-cancel
            toast.error("Payment session expired. Please cancel and start a new order.");
        } finally {
            setIsCompletingPayment(false);
        }
    };

    // ── Cancel Pending Order (Start New) ─────────────────────────────────
    const handleCancelPending = async () => {
        if (!pendingOrder?._id) return;

        try {
            setIsCancellingOrder(true);
            await axiosInstance.delete(`/order/cancel/${pendingOrder._id}`);
            toast.success("Previous order cancelled. You can place a new order now.");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setIsCancellingOrder(false);
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

    const formatPickupDate = (slotDate: string) =>
        new Date(`${slotDate}T00:00:00`).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });

    const handleSelectPickupSlot = async (slotDate: string, slotLabel: string) => {
        if (!slotOrderId) return;

        try {
            setIsSelectingPickupSlot(true);
            await axiosInstance.post(`/order/pickup-slot/${slotOrderId}`, { slotDate, slotLabel });
            toast.success('Pickup slot selected successfully');
            await fetchOrders();
            await fetchPickupSlots(slotOrderId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to select pickup slot');
            await fetchPickupSlots(slotOrderId);
        } finally {
            setIsSelectingPickupSlot(false);
        }
    };

    const slotTargetOrder =
        (slotOrderId && orders.find(o => o._id === slotOrderId)) ||
        orders.find(o => ['Order Placed', 'Pending', 'Prepared'].includes(o.status));

    useEffect(() => {
        if (!slotTargetOrder || slotOrderId === slotTargetOrder._id) return;
        fetchPickupSlots(slotTargetOrder._id);
    }, [slotTargetOrder, slotOrderId, fetchPickupSlots]);

    const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalCartPrice = Object.entries(cart).reduce((total, [id, qty]) => {
        const item = laundryItems.find(i => i._id === id);
        return total + (item?.pricePerUnit || 0) * qty;
    }, 0);

    // ── Fetch discount preview when cart changes ──────────────────────────
    useEffect(() => {
        if (totalCartItems === 0) {
            setDiscountPreview(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsLoadingDiscounts(true);
                const itemsPayload = Object.entries(cart).map(([laundryItem, quantity]) => ({
                    laundryItem,
                    quantity
                }));
                const { data } = await axiosInstance.post('/pricing/preview', { items: itemsPayload });
                setDiscountPreview(data?.data || null);
            } catch {
                setDiscountPreview(null);
            } finally {
                setIsLoadingDiscounts(false);
            }
        }, 400); // Debounce 400ms

        return () => clearTimeout(timer);
    }, [cart, totalCartItems]);

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

            {/* ─── Pending Payment Banner ─────────────────────────────────────── */}
            {pendingOrder && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-[2rem] border-2 border-orange-200 shadow-lg overflow-hidden animate-fade-in">
                    <div className="px-6 sm:px-8 py-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 border-2 border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
                                <HiExclamationTriangle className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-extrabold text-orange-800 mb-1">
                                    Pending Payment — Order #{pendingOrder._id.slice(-6).toUpperCase()}
                                </h3>
                                <p className="text-orange-700/80 text-sm mb-1">
                                    You have an unpaid order for <strong className="text-orange-800">₹{(pendingOrder.moneyAmount / 100).toFixed(2)}</strong> with {pendingOrder.totalClothes} item{pendingOrder.totalClothes !== 1 ? 's' : ''}.
                                </p>
                                <p className="text-orange-600/60 text-xs">
                                    Complete the payment to confirm your order, or cancel it to start fresh.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-5">
                            <button
                                onClick={handleCompletePayment}
                                disabled={isCompletingPayment}
                                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-orange-300/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCompletingPayment ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Opening Gateway...
                                    </>
                                ) : (
                                    <>
                                        <HiCreditCard className="w-5 h-5" />
                                        Complete Payment
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCancelPending}
                                disabled={isCancellingOrder}
                                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-orange-700 bg-white border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 shadow-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCancellingOrder ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <HiXMark className="w-5 h-5" />
                                        Cancel &amp; Start New
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {slotTargetOrder && slotTargetOrder.status !== 'Cancelled' && (
                <div className="bg-surface rounded-[2rem] border border-accent/20 shadow-lg overflow-hidden animate-fade-in">
                    <div className="px-6 sm:px-8 py-6 border-b border-accent/20 bg-bg/50">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <HiCalendarDays className="w-6 h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-extrabold text-text">
                                    Optional Pickup Slot Selection
                                </h3>
                                <p className="text-sm text-muted mt-1">
                                    Order #{slotTargetOrder._id.slice(-6).toUpperCase()} is confirmed. Choose a pickup slot (from {minPickupDaysAhead} days ahead) or skip to continue with normal flow.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {slotTargetOrder.pickupSlot && (
                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                Selected slot: <strong>{formatPickupDate(slotTargetOrder.pickupSlot.slotDate)}</strong> ({slotTargetOrder.pickupSlot.slotLabel})
                            </div>
                        )}

                        {isLoadingPickupSlots ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="h-20 rounded-2xl bg-accent/10 animate-pulse" />
                                ))}
                            </div>
                        ) : pickupSlots.length === 0 ? (
                            <p className="text-sm text-muted">No slots available right now. You can continue without selecting a slot.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {pickupSlots.map((slot) => {
                                    const isSelected = slotTargetOrder.pickupSlot?.slotDate === slot.slotDate
                                        && slotTargetOrder.pickupSlot?.slotLabel === slot.slotLabel;
                                    const isDisabled = isSelectingPickupSlot || (!slot.isAvailable && !isSelected);

                                    return (
                                        <button
                                            key={`${slot.slotDate}-${slot.slotLabel}`}
                                            onClick={() => handleSelectPickupSlot(slot.slotDate, slot.slotLabel)}
                                            disabled={isDisabled}
                                            className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                                                isSelected
                                                    ? 'border-emerald-300 bg-emerald-50'
                                                    : slot.isAvailable
                                                        ? 'border-accent/20 bg-bg hover:border-primary/40 hover:shadow-sm'
                                                        : 'border-red-200 bg-red-50 opacity-70 cursor-not-allowed'
                                            }`}
                                        >
                                            <p className="text-sm font-bold text-text">{formatPickupDate(slot.slotDate)}</p>
                                            <p className="text-xs text-muted mt-1">{slot.slotLabel}</p>
                                            <p className={`text-xs font-semibold mt-2 ${slot.remaining > 0 || isSelected ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isSelected ? 'Selected' : slot.remaining > 0 ? `${slot.remaining} slots left` : 'Slot full'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                    <div className="mt-10 pt-8 border-t border-accent/20 space-y-5">

                        {/* ── Live Discount Preview ── */}
                        {totalCartItems > 0 && discountPreview && discountPreview.discounts.length > 0 && (
                            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 animate-fade-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <HiSparkles className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider">Discounts Applied</span>
                                </div>
                                <div className="space-y-2">
                                    {discountPreview.discounts.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <HiReceiptPercent className="w-4 h-4 text-emerald-500" />
                                                <span className="text-emerald-800 font-semibold">{d.label}</span>
                                                <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                                    {d.discountPercent}% OFF
                                                </span>
                                            </div>
                                            <span className="font-extrabold text-emerald-700">-₹{(d.discountAmount / 100).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
                                    <span className="text-sm font-bold text-emerald-700">You save</span>
                                    <span className="text-lg font-extrabold text-emerald-700">₹{(discountPreview.totalDiscount / 100).toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Loading shimmer for discount preview */}
                        {totalCartItems > 0 && isLoadingDiscounts && !discountPreview && (
                            <div className="h-16 rounded-2xl bg-emerald-50 border border-emerald-200 animate-pulse" />
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="text-center sm:text-left">
                               <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Total Amount</p>
                               {discountPreview && discountPreview.totalDiscount > 0 ? (
                                   <div className="flex items-center gap-3">
                                       <p className="text-lg font-bold text-muted line-through">₹{totalCartPrice.toFixed(2)}</p>
                                       <p className="text-3xl font-extrabold text-emerald-700">₹{(discountPreview.finalAmount / 100).toFixed(2)}</p>
                                   </div>
                               ) : (
                                   <p className="text-3xl font-extrabold text-text">₹{totalCartPrice.toFixed(2)}</p>
                               )}
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={totalCartItems === 0 || isPlacingOrder || !!pendingOrder}
                                    className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-300 shadow-xl w-full sm:w-auto justify-center ${
                                        totalCartItems > 0 && !isPlacingOrder && !pendingOrder
                                        ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/30 hover:-translate-y-1' 
                                        : 'bg-surface text-muted cursor-not-allowed border border-accent/20'
                                    }`}
                                    title={pendingOrder ? "Complete or cancel your pending payment first" : undefined}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            Place Order Securely
                                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-sm ml-2">{totalCartItems} Items</span>
                                        </>
                                    )}
                                </button>
                                {pendingOrder && totalCartItems > 0 && (
                                    <p className="text-xs text-orange-500 font-semibold mt-2 text-center">
                                        ⚠️ Complete or cancel your pending payment first
                                    </p>
                                )}
                            </div>
                        </div>
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
                            {orders.map(order => {
                                const isExpanded = expandedOrderId === order._id;
                                return (
                                    <div key={order._id} className={`rounded-[1.5rem] border transition-all duration-300 ${
                                        isExpanded
                                            ? 'border-primary/30 shadow-lg bg-bg/50'
                                            : 'border-accent/10 hover:border-primary/30 hover:bg-bg'
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
                                                                Pickup: {formatPickupDate(order.pickupSlot.slotDate)} ({order.pickupSlot.slotLabel})
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ml-auto">
                                                <div className="flex -space-x-3 overflow-hidden">
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
                                                <HiChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        {/* Expandable timeline panel */}
                                        <div
                                            className="overflow-hidden transition-all duration-400 ease-in-out"
                                            style={{
                                                maxHeight: isExpanded ? '500px' : '0px',
                                                opacity: isExpanded ? 1 : 0,
                                            }}
                                        >
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="border-t border-accent/15 pt-4">
                                                    <h5 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Order Progress</h5>
                                                    <OrderTimeline
                                                        currentStatus={order.status}
                                                        createdAt={order.createdAt}
                                                    />

                                                    {/* Discount breakdown */}
                                                    {order.appliedDiscounts && order.appliedDiscounts.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-accent/15">
                                                            <h5 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Discounts Applied</h5>
                                                            <div className="space-y-1.5">
                                                                {order.appliedDiscounts.map((d, i) => (
                                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <HiReceiptPercent className="w-3.5 h-3.5 text-emerald-500" />
                                                                            <span className="text-text/80 font-medium">{d.label}</span>
                                                                            <span className="text-[0.6rem] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">{d.discountPercent}%</span>
                                                                        </div>
                                                                        <span className="font-bold text-emerald-600">-₹{(d.discountAmount / 100).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center justify-between text-sm pt-1.5 border-t border-accent/10">
                                                                    <span className="font-semibold text-muted">Subtotal</span>
                                                                    <span className="font-bold text-muted line-through">₹{((order.subtotalAmount || order.moneyAmount) / 100).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="font-bold text-emerald-700">You saved</span>
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
