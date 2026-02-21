import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePassword, deleteUser, forgotPassword, getAllUsers, getProfile, loginUser, logout, refreshAccessToken, registerUser, requestNewVerificationCode, resetPassword, updateUserAvatar, updateUserDetails, verifyVerificationCode } from "../controllers/user.controller.js";
import { verifyJWT, hydrateAuth, verifyAdmin } from "../middlewares/auth.middleware.js"


const router = Router();


// ─── Public Routes (No Auth Required) ────────────────────────────────────

router.route("/register")
    .post(upload.single('avatar'), registerUser);

router.route("/login")
    .post(loginUser);

router.route("/verify-code")
    .post(verifyVerificationCode);

router.route("/request-new-code")
    .post(requestNewVerificationCode);

router.route("/refresh-token")
    .post(refreshAccessToken);


// ─── Password Reset (No Auth Required) ───────────────────────────────────

router.route("/reset")
    .patch(forgotPassword);

router.route("/reset/:resetToken")
    .patch(resetPassword);


// ─── Protected Routes (Auth Required) ────────────────────────────────────

router.route("/logout")
    .post(verifyJWT, logout);

router.route("/me")
    .get(verifyJWT, hydrateAuth, getProfile);

router.route("/change-password")
    .patch(verifyJWT, changePassword);

router.route("/update")
    .patch(verifyJWT, updateUserDetails);

router.route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);


// ─── Admin Routes ────────────────────────────────────────────────────────

router.route("/getall")
    .get(verifyJWT, verifyAdmin, getAllUsers);

router.route("/delete/:userId")
    .delete(verifyJWT, verifyAdmin, deleteUser);


export default router;