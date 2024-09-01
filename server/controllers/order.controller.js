import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model.js";


const addNewOrder = asyncHandler(async(req, res, next) => {
    try{
        const { moneyPaid, totalClothes } = req.body;
        const userId = req.user._id;

        if(!moneyPaid || !totalClothes){
            throw new ApiError(400, 'All fields are mandatory');
        }

        const order = await Order.create({
            moneyPaid,
            totalClothes,
            user : userId
        })

        if(!order){
            throw new ApiError(400, "Order not created !!");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {$push : {history : order._id}},
            {new : true, useFindAndModify : false}
        )

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







export {
    addNewOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByUser
}

