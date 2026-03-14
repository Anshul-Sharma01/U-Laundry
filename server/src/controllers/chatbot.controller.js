import { ApiError } from "../utils/ApiError.js";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Context about U-Laundry service to provide to the AI
 */
const SYSTEM_CONTEXT = `You are a helpful assistant for U-Laundry, a university laundry service platform. 

Here's important context about the service:
- Students can place orders for laundry items through the platform
- Orders go through these statuses: Payment left → Order Placed → Pending → Prepared → Picked Up → Cancelled
- Payment is done through Razorpay (supports UPI, cards, net banking)
- Operating hours: 9:00 AM to 8:00 PM, Monday through Saturday
- Students can track their orders in real-time from their order history
- Orders can be cancelled before pickup
- Pricing varies by item type and is shown in the catalog
- Standard processing time is 24-48 hours

Your role is to:
- Answer questions about the laundry service, order tracking, payment, pricing, and policies
- Be friendly, helpful, and concise
- If you don't know something specific, suggest the user check their order history or contact support
- Keep responses under 200 words unless more detail is specifically requested

Always be professional and helpful.`;

/**
 * Handle chatbot question and return AI response
 */
export const askChatbot = async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            throw new ApiError(400, "Question is required and must be a non-empty string");
        }

        if (!process.env.GROQ_API_KEY) {
            throw new ApiError(500, "Chatbot service is not configured. Please contact administrator.");
        }

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_CONTEXT
                },
                {
                    role: "user",
                    content: question.trim()
                }
            ],
            model: "llama-3.1-8b-instant", // Fast and efficient model
            temperature: 0.7,
            max_tokens: 500,
        });

        const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        res.status(200).json({
            success: true,
            data: {
                answer: answer.trim()
            }
        });

    } catch (error) {
        console.error("Chatbot error:", error);
        
        if (error instanceof ApiError) {
            return next(error);
        }

        // Handle Groq API errors
        if (error.status === 401) {
            return next(new ApiError(500, "Chatbot API authentication failed. Please contact administrator."));
        }

        if (error.status === 429) {
            return next(new ApiError(429, "Too many requests. Please try again in a moment."));
        }

        next(new ApiError(500, "Failed to get response from chatbot. Please try again later."));
    }
};
