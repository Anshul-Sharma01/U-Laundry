import http from "http";
import app from "./app.js";
import connectionToDb from "./config/dbConnection.js";
import { initSocket } from "./utils/socketManager.js";

const PORT = process.env.PORT || 3000;

// Create a raw HTTP server so Socket.IO can share the same port as Express
const httpServer = http.createServer(app);

// Initialize Socket.IO before starting to listen
initSocket(httpServer);

httpServer.listen(PORT, async () => {
    await connectionToDb();
    console.log(`Server is listening at http://localhost:${PORT}`);
});
