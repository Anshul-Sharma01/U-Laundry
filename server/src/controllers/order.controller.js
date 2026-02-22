import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model.js";
import { LaundryItem } from "../models/laundryItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import razorpayService from "../utils/razorpayService.js";
import crypto from "crypto";

const VALID_STATUSES = ['Order Placed', 'Pending', 'Prepared', 'Picked Up', 'Cancelled', 'Payment left'];

const addNewOrder = asyncHandler(async(req, res) => {
    const { items, currency = "INR" } = req.body;
    const userId = req.user._id;

    // ── Validate items array ─────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items array is required and must not be empty");
    }

    if (!["INR", "USD", "EUR"].includes(currency)) {
        throw new ApiError(400, "Invalid currency. Supported: INR, USD, EUR");
    }

    // ── Validate each item against the LaundryItem catalog ───────────────
    let totalClothes = 0;
    let moneyAmount = 0;
    const validatedItems = [];

    // Collect all item IDs for a single bulk query
    const itemIds = items.map(item => {
        if (!item.laundryItem || !isValidObjectId(item.laundryItem)) {
            throw new ApiError(400, `Invalid laundry item ID: ${item.laundryItem}`);
        }
        if (!item.quantity || Number(item.quantity) < 1) {
            throw new ApiError(400, "Quantity must be at least 1 for each item");
        }
        return item.laundryItem;
    });

    // Check for duplicate item IDs in the same order
    const uniqueIds = new Set(itemIds);
    if (uniqueIds.size !== itemIds.length) {
        throw new ApiError(400, "Duplicate items found in order. Combine quantities instead");
    }

    // Fetch all referenced items in one query
    const catalogItems = await LaundryItem.find({ _id: { $in: itemIds } });

    if (catalogItems.length !== itemIds.length) {
        throw new ApiError(400, "One or more items do not exist in the catalog");
    }

    // Build a map for quick lookup
    const catalogMap = new Map();
    for (const catItem of catalogItems) {
        catalogMap.set(catItem._id.toString(), catItem);
    }

    // Validate each item
    for (const item of items) {
        const catItem = catalogMap.get(item.laundryItem.toString());

        if (!catItem.isActive) {
            throw new ApiError(400, `Item "${catItem.title}" is currently unavailable`);
        }

        const qty = Number(item.quantity);
        if (qty > catItem.maxQuantityPerOrder) {
            throw new ApiError(400, `Maximum ${catItem.maxQuantityPerOrder} units allowed for "${catItem.title}"`);
        }

        totalClothes += qty;
        moneyAmount += catItem.pricePerUnit * qty;

        validatedItems.push({
            laundryItem: catItem._id,
            quantity: qty
        });
    }

    if (moneyAmount <= 0) {
        throw new ApiError(400, "Order total must be greater than zero");
    }

    // ── Create Razorpay order ────────────────────────────────────────────
    const receipt = `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const amountInPaisa = Math.round(moneyAmount * 100);
    
    const paymentOrder = await razorpayService.createOrder(amountInPaisa, currency, receipt);

    // ── Create the order ─────────────────────────────────────────────────
    const order = await Order.create({
        items: validatedItems,
        totalClothes,
        moneyAmount: amountInPaisa,
        user: userId,
        razorpayOrderId: paymentOrder.id,
        receipt,
    });

    if (!order) {
        throw new ApiError(500, "Failed to create order");
    }

    await User.findByIdAndUpdate(
        userId,
        { $push: { history: order._id } },
        { new: true }
    );

    // Send confirmation email (non-blocking)
    const user = await User.findById(userId);
    if (user?.email) {
        sendEmail(
            user.email,
            "U-Laundry — Order Confirmation",
            `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50;">Order Confirmed! ✅</h2>
                <p>Your laundry order has been placed successfully.</p>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Total Items:</strong> ${totalClothes}</p>
                <p><strong>Amount:</strong> ₹${moneyAmount}</p>
                <p style="color: #999; font-size: 14px;">You will receive status updates via email.</p>
            </div>`
        ).catch(err => console.error("Failed to send order confirmation email:", err.message));
    }

    return res.status(201).json(
        new ApiResponse(201, order, "Order created successfully")
    );
})


const updateOrderStatus = asyncHandler(async(req, res) => {
    const { orderId, status } = req.params;

    if(!isValidObjectId(orderId)){
        throw new ApiError(400, "Invalid Order Id");
    }
    
    if(!VALID_STATUSES.includes(status)){
        throw new ApiError(400, `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}`);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set : { status } },
        { new : true }
    );

    if(!updatedOrder){
        throw new ApiError(404, "Order not found or could not be updated");
    }

    // Send status update email (non-blocking)
    const user = await User.findById(updatedOrder.user);
    if(user?.email){
        sendEmail(
            user.email,
            "U-Laundry — Order Status Updated",
            `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Order Status Update</h2>
                <p>Your order <strong>${orderId}</strong> status has been updated to:</p>
                <div style="background: #f4f4f4; padding: 10px 20px; border-radius: 8px; text-align: center; margin: 15px 0;">
                    <span style="font-size: 20px; font-weight: bold; color: #4CAF50;">${status}</span>
                </div>
            </div>`
        ).catch(err => console.error("Failed to send status update email:", err.message));
    }

    return res.status(200).json(
        new ApiResponse(200, updatedOrder, "Order status updated successfully")
    );
})


const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if(!isValidObjectId(orderId)){
        throw new ApiError(400, "Invalid Order Id");
    }

    const order = await Order.findById(orderId)
        .populate("user", "username name email hostelName roomNumber")
        .populate("items.laundryItem", "title image pricePerUnit category");

    if(!order){
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order details fetched successfully")
    );
})


const getOrdersByUser = asyncHandler(async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    const skip = ( page - 1 ) * limit;

    const { userId } = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }

    const totalOrders = await Order.countDocuments({ user : userId });

    if(totalOrders === 0){
        return res.status(200).json(
            new ApiResponse(200, {
                userOrders : [],
                totalOrders : 0,
                totalPages : 0,
                currentPage : page
            }, "No orders found for this user")
        );
    }

    const totalPages = Math.ceil(totalOrders / limit);
    if(page > totalPages){
        return res.status(200).json(
            new ApiResponse(200, {
                userOrders : [],
                totalOrders,
                totalPages,
                currentPage : page
            }, "Page exceeds total number of pages")
        );
    }

    const userOrders = await Order.find({ user : userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt : -1 })
        .populate("items.laundryItem", "title image pricePerUnit category");

    return res.status(200).json(
        new ApiResponse(200, {
            userOrders,
            totalOrders,
            totalPages,
            currentPage : page
        }, "User orders fetched successfully")
    );
});


const cancelOrder = asyncHandler(async( req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    if(!isValidObjectId(orderId)){
        throw new ApiError(400, "Invalid Order Id");
    }

    const order = await Order.findOneAndUpdate(
        { _id: orderId, user: userId, status: 'Payment left' },
        { $set: { status: 'Cancelled' } },
        { new: true }
    );

    if(!order){
        throw new ApiError(400, "Order cannot be cancelled (already processed or does not exist)");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
})


const getAllOrders = asyncHandler(async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 3;

    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();

    if(totalOrders === 0){
        return res.status(200).json(
            new ApiResponse(200, {
                orders: [],
                totalOrders: 0,
                totalPages: 0,
                currentPage: page,
            }, "No orders found")
        );
    }

    const totalPages = Math.ceil(totalOrders / limit);

    if (page > totalPages) {
        return res.status(200).json(
            new ApiResponse(200, {
                orders: [],
                totalOrders,
                totalPages,
                currentPage: page,
            }, "Page exceeds total number of pages")
        );
    }

    const orders = await Order.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("user", "username name email hostelName roomNumber studentId")
        .populate("items.laundryItem", "title image pricePerUnit category");

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            totalOrders,
            totalPages,
            currentPage: page,
        }, "Orders fetched successfully")
    );
});


const getOrdersByStatus = asyncHandler(async(req, res) => {
    const { status } = req.params;

    if (!VALID_STATUSES.includes(status)) {
        throw new ApiError(400, `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}`);
    }

    const orders = await Order.find({ status })
        .sort({ createdAt: -1 })
        .populate("user", "username name email hostelName")
        .populate("items.laundryItem", "title image pricePerUnit category");

    return res.status(200).json(
        new ApiResponse(200, orders, orders.length === 0 ? "No orders found for this status" : "Orders fetched by status")
    );
})


const verifyRazorpaySignature = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "All fields are required for payment verification");
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Verify the Razorpay signature
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (generated_signature !== razorpay_signature) {
        throw new ApiError(400, "Invalid payment signature — possible tampering detected");
    }

    // Update order status
    order.moneyPaid = true;
    order.razorpayPaymentId = razorpay_payment_id;
    order.status = "Order Placed";
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Payment verified successfully")
    );
});



export {
    addNewOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByUser,
    cancelOrder,
    getAllOrders,
    getOrdersByStatus,
    verifyRazorpaySignature
}
