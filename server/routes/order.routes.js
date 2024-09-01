import { Router } from "express";
import { verifyJWT, verifyModerator, verifyAdmin } from "../middlewares/auth.middleware.js";
import { addNewOrder, getOrderById, getOrdersByUser, updateOrderStatus } from "../controllers/order.controller.js";






const router = Router();


router.use(verifyJWT);


router.route("/add")
.post(addNewOrder);

router.route("/view/:userId")
.get(getOrdersByUser);

router.route("/view/:orderId")
.get(getOrderById);

// laundary-moderator routes
router.route("/update/:orderId/:status")
.patch( verifyModerator, updateOrderStatus);





export default router;



