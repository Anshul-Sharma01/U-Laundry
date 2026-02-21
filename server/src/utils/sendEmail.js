import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendEmail = async function ( email, subject, message ){
    try{
        const port = Number(process.env.SMTP_PORT);

        let transporter = nodemailer.createTransport({
            host : process.env.SMTP_HOST,
            port,
            secure : port === 465,
            auth : {
                user : process.env.SMTP_USERNAME,
                pass : process.env.SMTP_PASSWORD
            },
            tls : {
                rejectUnauthorized : false
            },
            connectionTimeout : 10000,
            socketTimeout : 10000
        })

        await transporter.sendMail({
            from : process.env.SMTP_FROM_EMAIL,
            to : email,
            subject : subject,
            html : message
        });

    }catch(err){
        console.error(`Error sending email : ${err}`);
        throw new ApiError(500, "Could not send email, please try again later...");
    }
}


export default sendEmail;
