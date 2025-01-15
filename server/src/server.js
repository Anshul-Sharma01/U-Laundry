import app from "./app.js";
import connectionToDb from "./config/dbConnection.js";
import { Server } from "socket.io";
import http from "http";


const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : [process.env.FRONTEND_URL],
        methods : ["GET", "POST"],
        credentials : true
    },
})

export { io };



server.listen(PORT, async() => {
    await connectionToDb();
    console.log(`Server is listening at http://localhost:${PORT}`);
})
