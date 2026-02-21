import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import razorpayService from "../utils/razorpayService.js";
import crypto from "crypto";

const VALID_STATUSES = ['Order Placed', 'Pending', 'Prepared', 'Picked Up', 'Cancelled', 'Payment left'];

const addNewOrder = asyncHandler(async(req, res) => {
    const { moneyAmount, totalClothes, currency = "INR" } = req.body;
    const userId = req.user._id;

    if(!moneyAmount || !totalClothes){
        throw new ApiError(400, 'Money amount and total clothes are required');
    }

    if(!["INR", "USD", "EUR"].includes(currency)){
        throw new ApiError(400, "Invalid currency. Supported: INR, USD, EUR");
    }

    if(Number(moneyAmount) <= 0 || Number(totalClothes) <= 0){
        throw new ApiError(400, "Amount and clothes count must be positive numbers");
    }

    const receipt = `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const amountInPaisa = Math.round(Number(moneyAmount) * 100); // Razorpay expects amount in smallest currency unit (paisa)
    
    const paymentOrder = await razorpayService.createOrder(amountInPaisa, currency, receipt);

    const order = await Order.create({
        moneyAmount : amountInPaisa,
        totalClothes : Number(totalClothes),
        user : userId,
        razorpayOrderId : paymentOrder.id,
        receipt,
    });

    if(!order){
        throw new ApiError(500, "Failed to create order");
    }

    await User.findByIdAndUpdate(
        userId,
        { $push : { history : order._id } },
        { new : true }
    );

    // Send confirmation email (non-blocking — don't fail the order if email fails)
    const user = await User.findById(userId);
    if(user?.email){
        sendEmail(
            user.email,
            "U-Laundry — Order Confirmation",
            `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50;">Order Confirmed! ✅</h2>
                <p>Your laundry order has been placed successfully.</p>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Total Clothes:</strong> ${totalClothes}</p>
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

    // Null-check BEFORE trying to use the order
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

    const order = await Order.findById(orderId).populate("user", "username name email hostelName roomNumber");

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

    // Count only THIS user's orders (not all orders)
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
        .sort({ createdAt : -1 });

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
        .populate("user", "username name email hostelName roomNumber studentId");

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
        .populate("user", "username name email hostelName");

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
