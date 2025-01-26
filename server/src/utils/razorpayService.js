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
        try {
            // Validate input parameters
            if (!amount || amount <= 0) {
                throw new Error("Invalid amount");
            }
            if (!currency || !["INR", "USD", "EUR"].includes(currency)) {
                throw new Error("Invalid currency");
            }
            if (!receipt) {
                throw new Error("Receipt is required");
            }

            const options = { 
                amount, 
                currency, 
                receipt 
            };
            // console.log("it came till here !!!");
            // console.log("Options being sent to Razorpay:", options);
            // console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
            // console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);


            const order = await this.instance.orders.create(options);

            // Check if the order was created successfully
            if (!order || !order.id) {
                throw new Error("Failed to create order");
            }

            return order;
        } catch (err) {
            console.error("Error from Razorpay API:", err);
            if (err.response) {
                console.error("Response Data:", err.response.data);
            }
            throw new Error("Failed to create payment order");
        }
        
    }

    verifySignature(body, signature) {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        return expectedSignature === signature;
    }

    async capturePayment(paymentId, amount) {
        try {
            if (!paymentId) {
                throw new Error("Payment ID is required");
            }
            if (!amount || amount <= 0) {
                throw new Error("Invalid amount");
            }

            return await this.instance.payments.capture(paymentId, amount);
        } catch (err) {
            console.error(`Error capturing payment: ${err}`);
            throw new Error("Failed to capture payment");
        }
    }
}

export default new RazorpayService();