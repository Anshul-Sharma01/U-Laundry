import { Server } from "socket.io";

/**
 * Singleton Socket.IO manager.
 * 
 * Usage:
 *   - Call initSocket(httpServer) once in server.js
 *   - Call getIO() anywhere to emit events
 */

let io = null;

/**
 * Initialize Socket.IO with the HTTP server.
 * Must be called before any getIO() calls.
 */
const initSocket = (httpServer) => {
    if (io) return io;

    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
        // Prevent memory leaks: disconnect idle clients after 2 minutes
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        /**
         * Student joins their personal room to receive order updates.
         * Room name: "user:<userId>"
         */
        socket.on("join:user", (userId) => {
            if (!userId || typeof userId !== "string") return;
            const room = `user:${userId}`;
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} joined room: ${room}`);
        });

        /**
         * Moderators join a shared room to receive new order notifications.
         * Room name: "moderators"
         */
        socket.on("join:moderators", () => {
            socket.join("moderators");
            console.log(`[Socket.IO] ${socket.id} joined room: moderators`);
        });

        socket.on("disconnect", (reason) => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id} — reason: ${reason}`);
        });

        socket.on("error", (err) => {
            console.error(`[Socket.IO] Socket error on ${socket.id}:`, err.message);
        });
    });

    return io;
};

/**
 * Get the initialized Socket.IO instance.
 * Throws if initSocket() was never called.
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Call initSocket(httpServer) first.");
    }
    return io;
};

export { initSocket, getIO };
