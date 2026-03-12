import mongoose, { Schema } from "mongoose";


const laundryItemSchema = new Schema({
    title : {
        type : String,
        required : [true, "Item title is required"],
        unique : true,
        trim : true,
        maxLength : [100, "Title cannot exceed 100 characters"]
    },
    image : {
        public_id : {
            type : String
        },
        secure_url : {
            type : String
        }
    },
    pricePerUnit : {
        type : Number,
        required : [true, "Price per unit is required"],
        min : [0, "Price cannot be negative"]
    },
    maxQuantityPerOrder : {
        type : Number,
        required : [true, "Max quantity per order is required"],
        min : [1, "Max quantity must be at least 1"],
        default : 10
    },
    category : {
        type : String,
        enum : ['clothes', 'bedding', 'accessories', 'others'],
        default : 'clothes'
    },
    description : {
        type : String,
        trim : true,
        maxLength : [500, "Description cannot exceed 500 characters"]
    },
    isActive : {
        type : Boolean,
        default : true
    }
}, {
    timestamps : true
});


export const LaundryItem = mongoose.model("LaundryItem", laundryItemSchema);
