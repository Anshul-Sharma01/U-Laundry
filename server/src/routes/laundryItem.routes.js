import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createItem,
    getAllItems,
    getItemById,
    getAllItemsAdmin,
    updateItem,
    updateItemImage,
    deleteItem
} from "../controllers/laundryItem.controller.js";


const router = Router();


// All routes require authentication
router.use(verifyJWT);


// ─── Static paths FIRST (before parameterized /:itemId) ──────────────────────

router.route("/")
    .get(getAllItems)
    .post(verifyAdmin, upload.single("image"), createItem);

router.route("/admin/all")
    .get(verifyAdmin, getAllItemsAdmin);


// ─── Parameterized paths AFTER static ones ───────────────────────────────────

router.route("/:itemId")
    .get(getItemById)
    .patch(verifyAdmin, updateItem)
    .delete(verifyAdmin, deleteItem);

router.route("/:itemId/image")
    .patch(verifyAdmin, upload.single("image"), updateItemImage);


export default router;
