import { io, Socket } from "socket.io-client";

/**
 * Singleton Socket.IO client service.
 *
 * Rules:
 * - connect(userId, role) — call after login/hydration
 * - disconnect()          — call on logout
 * - getSocket()           — returns the active socket (or null)
 *
 * The socket is intentionally NOT auto-connected on import to avoid
 * connecting before the user is authenticated.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

// Strip trailing /api/v1 path so we connect to the socket root
const SOCKET_URL = BACKEND_URL.replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

const connect = (userId: string, role: string): Socket => {
    // Already connected with the same socket — reuse it
    if (socket?.connected) return socket;

    // If a stale disconnected socket exists, clean it up first
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
        console.log("[Socket.IO] Connected:", socket?.id);

        // Join the personal user room for order status updates
        socket?.emit("join:user", userId);

        // Moderators also join the shared moderators room
        if (role === "laundry-moderator" || role === "admin") {
            socket?.emit("join:moderators");
        }
    });

    socket.on("connect_error", (err) => {
        console.error("[Socket.IO] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
        console.log("[Socket.IO] Disconnected:", reason);
    });

    return socket;
};

const disconnect = (): void => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        console.log("[Socket.IO] Manually disconnected and cleaned up.");
    }
};

const getSocket = (): Socket | null => socket;

const socketService = { connect, disconnect, getSocket };
export default socketService;
