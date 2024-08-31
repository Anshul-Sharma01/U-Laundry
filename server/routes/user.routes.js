import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePassword, deleteUser, forgotPassword, getAllUsers, getProfile, loginUser, logout, refreshAccessToken, registerUser, resetPassword, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router();



router
.route("/register")
.post(
    upload.single('avatar'),
    registerUser
)

// User-authentication routes
router.route("/login")
.post(loginUser);

router.route("/logout")
.post(verifyJWT, logout);

router.route("/me")
.post(verifyJWT, getProfile);


// Password updation routes 
router.route("/reset")
.patch(verifyJWT, forgotPassword);

router.route("/reset/:resetToken")
.patch(resetPassword);

router.route("/change-password")
.patch(verifyJWT, changePassword);

router.route("/refreh-token")
.post(refreshAccessToken);


// user details updation routes 
router.route("/update")
.patch(verifyJWT, updateUserDetails);

router.route("/update-avatar")
.patch(verifyJWT, updateUserAvatar);


// admin routes
router.route("/getall")
.get(verifyAdmin, getAllUsers);

router.route("/delete/:userId")
.delete(verifyAdmin, deleteUser);

export default router;