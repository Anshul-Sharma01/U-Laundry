import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import razorpayService from "../utils/razorpayService.js";


/**
 * Razorpay Webhook Handler
 * 
 * This endpoint receives server-to-server calls from Razorpay.
 * It acts as a safety net for cases where the frontend verify-signature
 * call never fires (user closes browser, network failure, etc.).
 * 
 * NO JWT required — authenticated via Razorpay webhook signature.
 * Must receive RAW body (not parsed JSON) for signature verification.
 */
const handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).json({ success: false, message: "Missing signature" });
        }

        // req.rawBody must be set by express raw body middleware for this route
        const rawBody = req.rawBody;

        if (!rawBody) {
            console.error("Webhook: rawBody is not available. Ensure express.raw() middleware is applied.");
            return res.status(400).json({ success: false, message: "Raw body not available" });
        }

        // Verify webhook signature
        let isValid = false;
        try {
            isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
        } catch (err) {
            console.error("Webhook signature verification error:", err.message);
            return res.status(400).json({ success: false, message: "Signature verification failed" });
        }

        if (!isValid) {
            console.warn("Webhook: Invalid signature received");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Parse the verified payload
        const event = JSON.parse(rawBody);
        const eventType = event.event;

        // Only handle payment.captured events
        if (eventType === "payment.captured") {
            const payment = event.payload?.payment?.entity;

            if (!payment) {
                console.warn("Webhook: payment.captured event with no payment entity");
                return res.status(200).json(new ApiResponse(200, null, "No payment entity, skipped"));
            }

            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            if (!razorpayOrderId) {
                return res.status(200).json(new ApiResponse(200, null, "No order_id in payment, skipped"));
            }

            const order = await Order.findOne({ razorpayOrderId });

            if (!order) {
                console.warn(`Webhook: No order found for razorpayOrderId ${razorpayOrderId}`);
                // Return 200 so Razorpay doesn't retry
                return res.status(200).json(new ApiResponse(200, null, "Order not found, skipped"));
            }

            // Idempotency: skip if already paid
            if (order.moneyPaid) {
                return res.status(200).json(new ApiResponse(200, null, "Already processed"));
            }

            // Mark as paid
            order.moneyPaid = true;
            order.razorpayPaymentId = razorpayPaymentId;
            order.status = "Order Placed";
            await order.save();

            console.log(`Webhook: Order ${order._id} marked as paid via webhook`);
        }

        // Always return 200 for handled events (Razorpay retries on non-2xx)
        return res.status(200).json(new ApiResponse(200, null, "Webhook processed"));

    } catch (err) {
        console.error("Webhook processing error:", err);
        // Still return 200 to prevent Razorpay retry loops on parse errors
        return res.status(200).json({ success: false, message: "Internal error during webhook processing" });
    }
};


export { handleRazorpayWebhook };
