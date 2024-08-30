import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { config } from "dotenv";
config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(morgan("dev"));



app.get("/", (req, res) => {
    res.send("Server started");
})


// all routes import go here
import userRouter from "./routes/user.routes.js";



app.use("/api/v1/users", userRouter);


export default app;





