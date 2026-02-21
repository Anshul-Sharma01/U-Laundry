import mongoose, { Schema } from "mongoose";


const orderSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : [true, "User reference is required"]
    },
    totalClothes : {
        type : Number,
        required : [true, "Total number of clothes is required"],
        min : [1, "Number of clothes must be at least 1"]
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
    razorpayPaymentId : {
        type : String
    },
    receipt : {
        type : String, 
    }
}, {
    timestamps : true
})


export const Order = mongoose.model("Order", orderSchema);
