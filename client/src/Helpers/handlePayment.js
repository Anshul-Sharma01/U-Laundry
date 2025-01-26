
import { verifyPaymentThunk } from "../Redux/Slices/orderSlice";
import toast from "react-hot-toast";


export const handlePayment = ( orderId, amount, receipt, dispatch, userData ) => {
    const options = {
        key : import.meta.env.VITE_RAZORPAY_KEY,
        amount : amount * 100,
        currency : "INR",
        name : "Laundry Service",
        description : `Order Receipt : ${receipt}`,
        order_id : orderId,
        handler : async(response) => {
            const paymentData = {
                razorpay_order_id : response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
            };
            const result = await dispatch(verifyPaymentThunk(paymentData));
            if(result.payload){
                toast.success("Payment Verified successfully");
            }else{
                toast.error("Payment Verification Failed");
            }
        },
        prefill : {
            name : userData.name,
            email : userData.email,
        },
        theme : {
            color : '#F37254'
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", (response) => {
        toast.error("Payment Failed !!, please try again.");
        console.error("Razorpay error : ", response.error);
    })
}


