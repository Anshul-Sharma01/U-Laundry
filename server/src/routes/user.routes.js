import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePassword, deleteUser, forgotPassword, getAllUsers, getProfile, loginUser, logout, refreshAccessToken, registerUser, requestNewVerificationCode, resetPassword, updateUserAvatar, updateUserDetails, verifyVerificationCode } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"


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

router.route("/verify-code")
.post(verifyVerificationCode);

router.route("/request-new-code")
.post(requestNewVerificationCode); 

router.route("/logout")
.post(verifyJWT, logout);

router.route("/me")
.post(verifyJWT, getProfile);


// Password updation routes 
router.route("/reset")
.patch( forgotPassword);

router.route("/reset/:resetToken")
.patch(resetPassword);

router.route("/change-password")
.patch(verifyJWT, changePassword);

router.route("/refresh-token")
.post(refreshAccessToken);


// user details updation routes 
router.route("/update")
.patch(verifyJWT, updateUserDetails);

router.route("/update-avatar")
.patch(verifyJWT, upload.single("avatar"), updateUserAvatar);


// admin routes
// router.route("/getall")
// .get(verifyAdmin, getAllUsers);

// router.route("/delete/:userId")
// .delete(verifyAdmin, deleteUser);

export default router;