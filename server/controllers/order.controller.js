import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import {razorpayService} from "../utils/razorpayService.js";


const addNewOrder = asyncHandler(async(req, res, next) => {
    try{
        const { moneyAmount, totalClothes, currency} = req.body;
        const userId = req.user._id;

        if(!moneyAmount || !totalClothes){
            throw new ApiError(400, 'All fields are mandatory');
        }

        if(!["INR", "USD", "EUR"].includes(currency)){
            throw new ApiError(400, "Invalid Currency");
        }

        const receipt = `receipt_${Math.floor(MAth.random() * 100000)}`;
        const amount = moneyAmount * 100;

        const paymentOrder = await razorpayService.createOrder(amount, currency, receipt);

        const order = await Order.create({
            moneyAmount : amount,
            totalClothes,
            user : userId,
            razorpayOrderId : paymentOrder.id,
            receipt
        })

        if(!order){
            throw new ApiError(400, "Order not created !!");
        }



        const user = await User.findByIdAndUpdate(
            userId,
            {$push : {history : order._id}},
            {new : true, useFindAndModify : false}
        )

        const userEmail = user.email;

        const subject = "Order confirmation Mail";
        const msg = "Your Order has been successfully placed";

        try {
            await sendEmail(userEmail, subject, msg);
        } catch (err) {
            console.error("Failed to send Order confirmation emaik : ",err.message);
        }

        return res.status(201)
        .json(
            new ApiResponse(201, order, "Order created successfully")
        );


    }catch(err){
        throw new ApiError(500, err?.message || "Error occurred while placing new order");
    }
})


const updateOrderStatus = asyncHandler(async(req, res, next) => {
    try{
        const { orderId, status } = req.params;

        if(!isValidObjectId(orderId)){
            throw new ApiError(400, "Invalid Order Id");
        }
        
        if(!['Order Placed', 'Pending', 'Prepared', 'Picked Up'].includes(status)){
            throw new ApiError(400, "Invalid Status");
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set : {status} },
            {new : true, useFindAndModify : false}
        );

        const user = await User.findById(updatedOrder.user);
        
        const userEmail = user.email;
        const subject = "Laundary Order Status Updated";
        const msg = `Your Order status is updated to ${status}`;

        try {
            await sendEmail(userEmail, subject, msg);
        } catch (err) {
            console.error("Error occurred while sending status update email : ", err.message);
        }

        if(!updatedOrder){
            throw new ApiError(400, "Order not found or could not be updated");
        }


        return res.status(200)
        .json(new ApiResponse(200, updatedOrder, "Order status update successfully"));

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating the order status");
    }
})


const getOrderById = asyncHandler(async (req, res, next) => {
    try{
        const { orderId } = req.params;

        if(!isValidObjectId(orderId)){
            throw new ApiError(400, "Invalid Order Id");
        }

        const order = await Order.findById(orderId);

        if(!order){
            throw new ApiError(400, "Order does not exists");
        }

        return res.status(200)
        .json(new ApiResponse(200, order, "Order details fetched successfully"));

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetch order details");
    }
})


const getOrdersByUser = asyncHandler(async (req, res, next) => {
    try{
        const { userId } = req.params;
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid Order Id");
        }

        const userOrders = await Order.find({user : userId});

        if(userOrders.length === 0){
            return res.status(200).json(new ApiResponse(200, userOrders, "User Orders doesn't exists"));
        }

        return res.status(200).json(new ApiResponse(200, userOrders, "User Orders fetched successfully"));

    }catch(err){
        throw new ApiError(400, "Error occurred while fetching User orders");
    }
});


const cancelOrder = asyncHandler(async( req, res, next) => {
    try{    
        const { orderId } = req.params;
        const userId = req.user._id;
        
        if(!isValidObjectId(orderId)){
            throw new ApiError(400, "Invalid Order Id");
        }

        const order = await Order.findByIdAndUpdate(
            { _id : orderId, user : userId, status : 'Order Placed' },
            { $set : { status : 'Cancelled' } },
            { new : true, useFindAndModify : false }
        );

        if(!order){
            throw new ApiError(400, "Order cannot be cancelled or does not exists");
        }

        return res.status(200)
        .json(
            new ApiResponse(200, order, "Order cancelled successfully")
        );
    }catch(err){
        throw new ApiError(400, "Error occurred while cancelling the order");
    }
})


const getAllOrders = asyncHandler(async(req, res, next) => {
    try{
        const allOrders = await Order.find({})
        
        if(allOrders.length === 0){
            return res.status(200)
            .json(
                new ApiResponse(200, allOrders, "No Orders")
            );
        }

        return res.status(200)
        .json(
            new ApiResponse(200, allOrders, "All Orders fetched Successfully")
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching all orders");
    }
})


const getOrdersByStatus = asyncHandler(async(req, res, next) => {
    try{
        const { status } = req.params;

        if(!['Order Placed', 'Pending', 'Prepared', 'Picked Up'].includes(status)){
            throw new ApiError(400, "Invalid status");
        }

        const orders = await Order.find({ status });

        if(!orders){
            return res.status(200)
            .json(
                new ApiResponse(200, orders, "No Orders Exists for the required status")
            );
        }

        return res.status(200)
        .json(
            new ApiResponse(200, orders, "Orders fetched on the basis of status")
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching orders by status");
    }
})




export {
    addNewOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByUser,
    cancelOrder,
    getAllOrders,
    getOrdersByStatus
}

