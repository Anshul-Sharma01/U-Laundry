import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";


const orderSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    totalClothes : {
        type : Number,
        required : [true, "Total number of clothes is required"],
        min : [0, "Number of clothes must be a positive number"]
    },
    date : {
        type : Date,
        default : Date.now,
        required : [true, "Date of service is required"],
    },
    status : {
        type : String,
        enum : ['Order Placed', 'Pending', 'Prepared','Picked Up','Cancelled', 'Payment left'],
        default : 'Payment left'
    },
    moneyAmount: {
        type: Number,
        required: [true, "Payment amount is required"],
        default : 0,
    },
    moneyPaid : {
        type : Boolean, 
        default : false
    },
    razorpayOrderId : {
        type : String
    },
    receipt : {
        type : String, 
    }
})


export const Order = mongoose.model("Order", orderSchema);
