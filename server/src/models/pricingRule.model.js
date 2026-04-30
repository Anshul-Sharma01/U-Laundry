import mongoose, { Schema } from "mongoose";


const pricingRuleSchema = new Schema({
    type : {
        type : String,
        enum : ['bulk', 'off_peak', 'loyalty'],
        required : [true, "Rule type is required"]
    },
    label : {
        type : String,
        required : [true, "Label is required"],
        trim : true,
        maxLength : [120, "Label cannot exceed 120 characters"]
    },
    description : {
        type : String,
        trim : true,
        maxLength : [300, "Description cannot exceed 300 characters"]
    },
    isActive : {
        type : Boolean,
        default : true
    },
    priority : {
        type : Number,
        default : 10,
        min : [0, "Priority cannot be negative"]
    },
    // ── Type-specific configuration ───────────────────────────────────
    // bulk:     { minItems: Number, discountPercent: Number }
    // off_peak: { startHour: Number, endHour: Number, discountPercent: Number }
    // loyalty:  { minOrders: Number, discountPercent: Number }
    config : {
        minItems : { type : Number },
        discountPercent : {
            type : Number,
            required : [true, "Discount percent is required"],
            min : [0, "Discount percent cannot be negative"],
            max : [100, "Discount percent cannot exceed 100"]
        },
        startHour : { type : Number, min : 0, max : 23 },
        endHour :   { type : Number, min : 0, max : 23 },
        minOrders : { type : Number, min : 0 }
    }
}, {
    timestamps : true
});

// Compound index for efficient querying of active rules by priority
pricingRuleSchema.index({ isActive: 1, priority: 1 });


export const PricingRule = mongoose.model("PricingRule", pricingRuleSchema);
