import { Router } from "express";
import { verifyJWT, verifyModerator } from "../middlewares/auth.middleware.js";
import { addNewOrder, cancelOrder, getAllOrders, getOrderById, getOrdersByStatus, getOrdersByUser, updateOrderStatus, verifyRazorpaySignature } from "../controllers/order.controller.js";


const router = Router();


// All order routes require authentication
router.use(verifyJWT);


// ─── Student Routes ──────────────────────────────────────────────────────

router.route("/add")
    .post(addNewOrder);

// Fixed: Renamed from "/view/:userId" to "/user/:userId" to avoid conflict with "/details/:orderId"
router.route("/user/:userId")
    .get(getOrdersByUser);

router.route("/cancel/:orderId")
    .delete(cancelOrder);

// Fixed: Renamed from "/view/:orderId" to "/details/:orderId" to resolve route conflict
router.route("/details/:orderId")
    .get(getOrderById);

router.route("/verify-signature")
    .post(verifyRazorpaySignature);


// ─── Moderator Routes ───────────────────────────────────────────────────
// Note: verifyJWT is already applied via router.use(), so not repeated here

router.route("/update/:orderId/:status")
    .patch(verifyModerator, updateOrderStatus);

router.route("/getall")
    .get(verifyModerator, getAllOrders);

router.route("/get/:status")
    .get(verifyModerator, getOrdersByStatus);


export default router;
