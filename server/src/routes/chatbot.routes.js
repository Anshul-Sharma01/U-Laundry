import { Router } from "express";
import { askChatbot } from "../controllers/chatbot.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Chatbot route - requires authentication
router.route("/ask")
    .post(verifyJWT, askChatbot);

export default router;
