import connectionToDb from "./src/config/dbConnection.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function fixIndex() {
    try {
        await connectionToDb();
        const db = mongoose.connection.db;
        console.log("Dropping studentId_1 index...");
        await db.collection("users").dropIndex("studentId_1");
        console.log("Successfully dropped index studentId_1!");
        process.exit(0);
    } catch (error) {
        console.error("Error dropping index:", error);
        process.exit(1);
    }
}

fixIndex();
