import { Router } from "express";
import { verifyJWT, verifyModerator, verifyAdmin } from "../middlewares/auth.middleware.js";
import { addNewOrder, cancelOrder, getAllOrders, getOrderById, getOrdersByStatus, getOrdersByUser, updateOrderStatus } from "../controllers/order.controller.js";






const router = Router();


router.use(verifyJWT);


router.route("/add")
.post(addNewOrder);

router.route("/view/:userId")
.get(getOrdersByUser);

router.route("/cancel/:orderId")
.delete(cancelOrder);

router.route("/view/:orderId")
.get(getOrderById);

// laundary-moderator routes
router.route("/update/:orderId/:status")
.patch( verifyModerator, updateOrderStatus);


router.route("/getall")
.get(verifyModerator, getAllOrders);

router.route("/get/:status")
.get(verifyModerator, getOrdersByStatus);



export default router;



