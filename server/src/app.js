import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import { config } from "dotenv";
config({ path: "./.env" });

import { ApiError } from "./utils/ApiError.js";


const app = express();

app.use(cors({
    origin : [process.env.FRONTEND_URL],
    credentials : true
}))

app.use(cookieParser());
app.use(express.json({ limit : '16kb' }));
app.use(express.urlencoded({ extended : true, limit : '16kb' }));
app.use(morgan("dev"));


app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "U-Laundry API Server is running" });
})


// ─── Routes ──────────────────────────────────────────────────────────────
import userRouter from "./routes/user.routes.js";
import orderRouter from "./routes/order.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/order", orderRouter);


// ─── 404 Handler ─────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});


// ─── Global Error Handler ────────────────────────────────────────────────
// Express requires exactly 4 params to recognize this as an error handler
app.use((err, req, res, _next) => {
    // If it's our custom ApiError, use its properties
    if(err instanceof ApiError){
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        });
    }

    // Handle Mongoose validation errors
    if(err.name === 'ValidationError'){
        const messages = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: messages
        });
    }

    // Handle Mongoose duplicate key errors
    if(err.code === 11000){
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            statusCode: 409,
            message: `${field} already exists`
        });
    }

    // Handle JWT errors
    if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'){
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
        });
    }

    // Default: unknown error
    console.error("Unhandled error:", err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: process.env.NODE_ENV === 'production' 
            ? "Internal server error" 
            : err.message || "Internal server error",
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});


export default app;
