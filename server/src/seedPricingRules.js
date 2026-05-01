/**
 * Seed script — Inserts default pricing rules into MongoDB.
 * Run with:  node --experimental-modules src/seedPricingRules.js
 */
import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: "./.env" });

import { PricingRule } from "./models/pricingRule.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/U-Laundary";

const DEFAULT_RULES = [
    {
        type: "bulk",
        label: "Bulk Discount (10+ items)",
        description: "Order 10 or more items and get 5% off your total",
        isActive: true,
        priority: 1,
        config: { minItems: 10, discountPercent: 5 },
    },
    {
        type: "bulk",
        label: "Big Bulk Discount (20+ items)",
        description: "Order 20 or more items and get 10% off your total",
        isActive: true,
        priority: 2,
        config: { minItems: 20, discountPercent: 10 },
    },
    {
        type: "off_peak",
        label: "Night Owl Discount",
        description: "Place orders between 10 PM and 6 AM for 3% off",
        isActive: true,
        priority: 3,
        config: { startHour: 22, endHour: 6, discountPercent: 3 },
    },
    {
        type: "loyalty",
        label: "Loyal Customer Reward",
        description: "Complete 10+ orders and enjoy a permanent 5% discount",
        isActive: true,
        priority: 4,
        config: { minOrders: 10, discountPercent: 5 },
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing rules to avoid duplicates
        const deleted = await PricingRule.deleteMany({});
        console.log(`Cleared ${deleted.deletedCount} existing pricing rules`);

        // Insert defaults
        const created = await PricingRule.insertMany(DEFAULT_RULES);
        console.log(`Seeded ${created.length} pricing rules:`);
        created.forEach((r) => console.log(`  ✓ [${r.type}] ${r.label} — ${r.config.discountPercent}% off`));

        await mongoose.disconnect();
        console.log("\nDone! Pricing rules are ready.");
        process.exit(0);
    } catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
}

seed();
