import Razorpay from "razorpay";

class RazorpayService {
    constructor(){
        this.instance = new Razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        })
    }
    async createOrder(amount, currency, receipt){
        try{
            const options = { amount, currency, receipt };
            return await this.instance.orders.create(options);

        }catch(err){
            console.error(`Error creating Razorpay order : `, err);
            throw new Error("Failed to create payment order");
        }
    }

    verifySignature(body, signature){
        const crypto = require("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');
        
        return expectedSignature === signature;
    }

    async capturePayment(paymentId, amount){
        try{
            return await this.instance.payments.capture(paymentId, amount);
        }catch(err){
            console.error(`Error capturing payment : ${err}`);
            throw new Error("Failed to capture payment");
        }
    }
}

module.exports = new RazorpayService();


