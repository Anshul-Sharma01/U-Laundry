import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    getAllPricingRules,
    getActivePricingRules,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    previewDiscounts,
} from "../controllers/pricing.controller.js";


const router = Router();

// All pricing routes require authentication
router.use(verifyJWT);


// ─── Student Routes ──────────────────────────────────────────────────────
router.route("/active")
    .get(getActivePricingRules);

router.route("/preview")
    .post(previewDiscounts);


// ─── Admin Routes ────────────────────────────────────────────────────────
router.route("/rules")
    .get(verifyAdmin, getAllPricingRules)
    .post(verifyAdmin, createPricingRule);

router.route("/rules/:ruleId")
    .patch(verifyAdmin, updatePricingRule)
    .delete(verifyAdmin, deletePricingRule);


export default router;
