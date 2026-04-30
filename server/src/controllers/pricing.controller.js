import { isValidObjectId } from "mongoose";
import { PricingRule } from "../models/pricingRule.model.js";
import { Order } from "../models/order.model.js";
import { LaundryItem } from "../models/laundryItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateDiscounts } from "../utils/pricingEngine.js";


// ─── GET /pricing/rules — All rules (admin/moderator) ────────────────────────
const getAllPricingRules = asyncHandler(async (req, res) => {
    const rules = await PricingRule.find().sort({ priority: 1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { rules }, "Pricing rules fetched successfully")
    );
});


// ─── GET /pricing/active — Active rules only (students, for display) ─────────
const getActivePricingRules = asyncHandler(async (req, res) => {
    const rules = await PricingRule.find({ isActive: true })
        .sort({ priority: 1 })
        .select("type label description config isActive");

    return res.status(200).json(
        new ApiResponse(200, { rules }, "Active pricing rules fetched successfully")
    );
});


// ─── POST /pricing/rules — Create rule (admin) ──────────────────────────────
const createPricingRule = asyncHandler(async (req, res) => {
    const { type, label, description, isActive, priority, config } = req.body;

    if (!type || !label || !config?.discountPercent) {
        throw new ApiError(400, "type, label, and config.discountPercent are required");
    }

    // Validate config based on type
    if (type === 'bulk' && (!config.minItems || config.minItems < 1)) {
        throw new ApiError(400, "Bulk rules require config.minItems >= 1");
    }
    if (type === 'off_peak' && (config.startHour === undefined || config.endHour === undefined)) {
        throw new ApiError(400, "Off-peak rules require config.startHour and config.endHour");
    }
    if (type === 'loyalty' && (!config.minOrders || config.minOrders < 1)) {
        throw new ApiError(400, "Loyalty rules require config.minOrders >= 1");
    }

    const rule = await PricingRule.create({
        type,
        label,
        description: description || "",
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 10,
        config,
    });

    return res.status(201).json(
        new ApiResponse(201, { rule }, "Pricing rule created successfully")
    );
});


// ─── PATCH /pricing/rules/:ruleId — Update rule (admin) ─────────────────────
const updatePricingRule = asyncHandler(async (req, res) => {
    const { ruleId } = req.params;

    if (!isValidObjectId(ruleId)) {
        throw new ApiError(400, "Invalid rule ID");
    }

    const allowedFields = ['type', 'label', 'description', 'isActive', 'priority', 'config'];
    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields to update");
    }

    const rule = await PricingRule.findByIdAndUpdate(
        ruleId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!rule) {
        throw new ApiError(404, "Pricing rule not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { rule }, "Pricing rule updated successfully")
    );
});


// ─── DELETE /pricing/rules/:ruleId — Delete rule (admin) ────────────────────
const deletePricingRule = asyncHandler(async (req, res) => {
    const { ruleId } = req.params;

    if (!isValidObjectId(ruleId)) {
        throw new ApiError(400, "Invalid rule ID");
    }

    const rule = await PricingRule.findByIdAndDelete(ruleId);

    if (!rule) {
        throw new ApiError(404, "Pricing rule not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { rule }, "Pricing rule deleted successfully")
    );
});


// ─── POST /pricing/preview — Preview discounts for a cart (student) ──────────
const previewDiscounts = asyncHandler(async (req, res) => {
    const { items } = req.body;
    const userId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items array is required");
    }

    // Calculate subtotal and totalClothes from the cart items
    const itemIds = items.map(i => i.laundryItem);
    const catalogItems = await LaundryItem.find({ _id: { $in: itemIds } });
    const catalogMap = new Map();
    for (const ci of catalogItems) {
        catalogMap.set(ci._id.toString(), ci);
    }

    let subtotalPaisa = 0;
    let totalClothes = 0;

    for (const item of items) {
        const catItem = catalogMap.get(item.laundryItem?.toString());
        if (!catItem) continue;
        const qty = Number(item.quantity) || 0;
        totalClothes += qty;
        subtotalPaisa += Math.round(catItem.pricePerUnit * qty * 100);
    }

    // Get user's completed order count for loyalty
    const userOrderCount = await Order.countDocuments({
        user: userId,
        status: { $in: ['Order Placed', 'Pending', 'Prepared', 'Picked Up'] }
    });

    // Fetch active rules
    const activeRules = await PricingRule.find({ isActive: true }).sort({ priority: 1 });

    const currentHour = new Date().getHours();
    const result = calculateDiscounts(subtotalPaisa, totalClothes, currentHour, userOrderCount, activeRules);

    return res.status(200).json(
        new ApiResponse(200, {
            subtotalPaisa,
            totalClothes,
            userOrderCount,
            ...result,
        }, "Discount preview calculated")
    );
});


export {
    getAllPricingRules,
    getActivePricingRules,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    previewDiscounts,
};
