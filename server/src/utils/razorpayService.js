import Razorpay from "razorpay";
import { config } from "dotenv";
import crypto from "crypto";

config({ path: "./.env" });

class RazorpayService {
    constructor() {
        this.instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount, currency, receipt) {
        if (!amount || amount <= 0) {
            throw new Error("Invalid amount");
        }
        if (!currency || !["INR", "USD", "EUR"].includes(currency)) {
            throw new Error("Invalid currency");
        }
        if (!receipt) {
            throw new Error("Receipt is required");
        }

        const options = { amount, currency, receipt };
        const order = await this.instance.orders.create(options);

        if (!order || !order.id) {
            throw new Error("Failed to create order");
        }

        return order;
    }

    verifySignature(body, signature) {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        return expectedSignature === signature;
    }

    verifyWebhookSignature(rawBody, receivedSignature) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "hex"),
            Buffer.from(receivedSignature, "hex")
        );
    }

    async createRefund(paymentId, amount) {
        if (!paymentId) {
            throw new Error("Payment ID is required");
        }
        if (!amount || amount <= 0) {
            throw new Error("Invalid refund amount");
        }

        return await this.instance.payments.refund(paymentId, {
            amount,
            speed: "normal",
        });
    }

    async capturePayment(paymentId, amount) {
        if (!paymentId) {
            throw new Error("Payment ID is required");
        }
        if (!amount || amount <= 0) {
            throw new Error("Invalid amount");
        }

        return await this.instance.payments.capture(paymentId, amount);
    }
}

export default new RazorpayService();