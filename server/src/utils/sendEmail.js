import { Resend } from "resend";
import { ApiError } from "./ApiError.js";
import { config } from "dotenv";
config({ path: "./.env" });


const resend = new Resend(`${process.env.RESEND_API_KEY}`);


const sendEmail = async function (email, subject, message) {
    try {
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "anshulsharma2926@gmail.com",
            subject: subject,
            html: message,
        });

        console.log("Email sent successfully:", response);
        return response;  // You can store response ID for tracking

    } catch (err) {
        console.error("Error sending email:", err);
        
        if (err.response && err.response.data) {
            console.error("Resend API Error Details:", err.response.data);
        }

        throw new ApiError(400, "Could not send email, please try again later...");
    }
};

export default sendEmail;
