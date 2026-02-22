import { isValidObjectId } from "mongoose";
import { LaundryItem } from "../models/laundryItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";


// ─── Admin: Create a new laundry item ────────────────────────────────────────
const createItem = asyncHandler(async (req, res) => {
    const { title, pricePerUnit, maxQuantityPerOrder, category, description } = req.body;

    if (!title || !pricePerUnit) {
        throw new ApiError(400, "Title and price per unit are required");
    }

    if (Number(pricePerUnit) < 0) {
        throw new ApiError(400, "Price per unit cannot be negative");
    }

    if (!req.file) {
        throw new ApiError(400, "Item image is required");
    }

    // Check for duplicate title
    const existingItem = await LaundryItem.findOne({ title: title.trim() });
    if (existingItem) {
        throw new ApiError(409, "An item with this title already exists");
    }

    // Upload image to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    const item = await LaundryItem.create({
        title: title.trim(),
        image: {
            public_id: cloudinaryResponse.public_id,
            secure_url: cloudinaryResponse.secure_url
        },
        pricePerUnit: Number(pricePerUnit),
        maxQuantityPerOrder: maxQuantityPerOrder ? Number(maxQuantityPerOrder) : 10,
        category: category || "clothes",
        description: description?.trim() || ""
    });

    if (!item) {
        throw new ApiError(500, "Failed to create laundry item");
    }

    return res.status(201).json(
        new ApiResponse(201, item, "Laundry item created successfully")
    );
});


// ─── Public: Get all active items (for booking page) ─────────────────────────
const getAllItems = asyncHandler(async (req, res) => {
    const items = await LaundryItem.find({ isActive: true })
        .sort({ category: 1, title: 1 })
        .select("-__v");

    return res.status(200).json(
        new ApiResponse(200, items, items.length === 0 ? "No items available" : "Items fetched successfully")
    );
});


// ─── Public: Get single item by ID ───────────────────────────────────────────
const getItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const item = await LaundryItem.findById(itemId).select("-__v");

    if (!item) {
        throw new ApiError(404, "Laundry item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Item fetched successfully")
    );
});


// ─── Admin: Get ALL items including inactive (for admin dashboard) ───────────
const getAllItemsAdmin = asyncHandler(async (req, res) => {
    const items = await LaundryItem.find()
        .sort({ createdAt: -1 })
        .select("-__v");

    return res.status(200).json(
        new ApiResponse(200, items, items.length === 0 ? "No items found" : "All items fetched successfully")
    );
});


// ─── Admin: Update item details (not image) ──────────────────────────────────
const updateItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { title, pricePerUnit, maxQuantityPerOrder, category, description, isActive } = req.body;

    if (!isValidObjectId(itemId)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const item = await LaundryItem.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Laundry item not found");
    }

    // Check for title uniqueness if title is being changed
    if (title && title.trim() !== item.title) {
        const duplicate = await LaundryItem.findOne({ title: title.trim(), _id: { $ne: itemId } });
        if (duplicate) {
            throw new ApiError(409, "An item with this title already exists");
        }
    }

    // Build update object — only include fields that were actually sent
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (pricePerUnit !== undefined) {
        if (Number(pricePerUnit) < 0) {
            throw new ApiError(400, "Price per unit cannot be negative");
        }
        updateFields.pricePerUnit = Number(pricePerUnit);
    }
    if (maxQuantityPerOrder !== undefined) {
        if (Number(maxQuantityPerOrder) < 1) {
            throw new ApiError(400, "Max quantity must be at least 1");
        }
        updateFields.maxQuantityPerOrder = Number(maxQuantityPerOrder);
    }
    if (category !== undefined) updateFields.category = category;
    if (description !== undefined) updateFields.description = description.trim();
    if (isActive !== undefined) updateFields.isActive = isActive;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updatedItem = await LaundryItem.findByIdAndUpdate(
        itemId,
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedItem, "Laundry item updated successfully")
    );
});


// ─── Admin: Update item image ────────────────────────────────────────────────
const updateItemImage = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
        throw new ApiError(400, "Invalid item ID");
    }

    if (!req.file) {
        throw new ApiError(400, "New image is required");
    }

    const item = await LaundryItem.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Laundry item not found");
    }

    // Delete old image from Cloudinary
    if (item.image?.public_id) {
        await deleteFromCloudinary(item.image.public_id);
    }

    // Upload new image
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload new image to Cloudinary");
    }

    item.image = {
        public_id: cloudinaryResponse.public_id,
        secure_url: cloudinaryResponse.secure_url
    };
    await item.save();

    return res.status(200).json(
        new ApiResponse(200, item, "Item image updated successfully")
    );
});


// ─── Admin: Delete item permanently ──────────────────────────────────────────
const deleteItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const item = await LaundryItem.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Laundry item not found");
    }

    // Delete image from Cloudinary
    if (item.image?.public_id) {
        await deleteFromCloudinary(item.image.public_id);
    }

    await LaundryItem.findByIdAndDelete(itemId);

    return res.status(200).json(
        new ApiResponse(200, null, "Laundry item deleted successfully")
    );
});


export {
    createItem,
    getAllItems,
    getItemById,
    getAllItemsAdmin,
    updateItem,
    updateItemImage,
    deleteItem
};
