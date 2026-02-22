import mongoose, { Schema } from "mongoose";


const orderItemSchema = new Schema({
    laundryItem : {
        type : Schema.Types.ObjectId,
        ref : "LaundryItem",
        required : [true, "Laundry item reference is required"]
    },
    quantity : {
        type : Number,
        required : [true, "Quantity is required"],
        min : [1, "Quantity must be at least 1"]
    }
}, { _id : false });


const orderSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : [true, "User reference is required"]
    },
    items : {
        type : [orderItemSchema],
        validate : {
            validator : function(arr) {
                return arr && arr.length > 0;
            },
            message : "Order must contain at least one item"
        }
    },
    totalClothes : {
        type : Number,
        default : 0
    },
    moneyAmount: {
        type: Number,
        default : 0,
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
