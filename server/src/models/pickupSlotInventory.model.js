import mongoose, { Schema } from "mongoose";

const pickupSlotInventorySchema = new Schema(
    {
        slotDate: {
            type: String,
            required: [true, "Slot date is required"], // YYYY-MM-DD
        },
        slotLabel: {
            type: String,
            required: [true, "Slot label is required"], // e.g., 09:00 AM - 11:00 AM
        },
        capacity: {
            type: Number,
            required: [true, "Slot capacity is required"],
            min: [1, "Slot capacity must be at least 1"],
        },
        bookedCount: {
            type: Number,
            default: 0,
            min: [0, "Booked count cannot be negative"],
        },
    },
    { timestamps: true }
);

pickupSlotInventorySchema.index({ slotDate: 1, slotLabel: 1 }, { unique: true });

export const PickupSlotInventory = mongoose.model("PickupSlotInventory", pickupSlotInventorySchema);
