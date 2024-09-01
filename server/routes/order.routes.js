import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addNewOrder, updateOrderStatus } from "../controllers/order.controller.js";






const router = Router();


router.use(verifyJWT);


router.route("/add")
.post(addNewOrder);


// laundary-moderator routes
router.route("/status/update")
.patch(updateOrderStatus);





export default router;



