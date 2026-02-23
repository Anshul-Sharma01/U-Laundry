import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


/**
 * verifyJWT — Decodes the access token and confirms identity.
 * Attaches a minimal user object (with role) to req.user.
 */
export const verifyJWT = asyncHandler( async (req, _, next) => {
    try{
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", "");

        if(!token || token.trim() === ""){
            throw new ApiError(401, "Unauthorized request — no token provided");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("+role");

        if(!user){
            throw new ApiError(401, "Invalid Access Token — user not found");
        }

        req.user = user;
        next();

    }catch(err){
        if(err instanceof ApiError) throw err;
        if(err.name === "TokenExpiredError"){
            throw new ApiError(401, "Access token has expired");
        }
        if(err.name === "JsonWebTokenError"){
            throw new ApiError(401, "Invalid access token");
        }
        throw new ApiError(401, err?.message || "Authentication failed");
    }
})


/**
 * hydrateAuth — Runs AFTER verifyJWT. 
 * Fetches the full, fresh user profile from the database and replaces req.user.
 * This ensures every downstream controller gets a complete, up-to-date user object
 * without redundant User.findById() calls.
 * 
 * On page refresh, the frontend calls GET /users/me → verifyJWT → hydrateAuth → controller
 * This is the backend half of the "auth hydration" pattern.
 */
export const hydrateAuth = asyncHandler(async (req, _, next) => {
    try {
        const user = await User.findById(req.user._id).select("+role");
        
        if(!user){
            throw new ApiError(401, "User no longer exists");
        }

        req.user = user;
        next();
    } catch(err) {
        if(err instanceof ApiError) throw err;
        throw new ApiError(500, "Failed to hydrate user session");
    }
});


/**
 * verifyModerator — Checks if the authenticated user has the 'laundry-moderator' role.
 */
export const verifyModerator = asyncHandler(async(req, _ , next) => {
    try{
        const { user } = req;

        if(!user || (user.role !== 'laundry-moderator' && user.role !== 'admin')){
            throw new ApiError(403, "Access forbidden — moderator role required");
        }

        next();

    }catch(err){
        if(err instanceof ApiError) throw err;
        throw new ApiError(403, err?.message || "Access to this particular route is forbidden");
    }
})


/**
 * verifyAdmin — Checks if the authenticated user has the 'admin' role.
 */
export const verifyAdmin = asyncHandler(async(req, _, next) => {
    try {
        const { user } = req;

        if(!user || user.role !== 'admin'){
            throw new ApiError(403, "Access forbidden — admin role required");
        }

        next();
    } catch(err) {
        if(err instanceof ApiError) throw err;
        throw new ApiError(403, err?.message || "Admin access required");
    }
});


/**
 * verifyVerified — Checks if the authenticated user's account has been verified by admin.
 * Blocks access for users whose accounts are still pending or rejected.
 */
export const verifyVerified = asyncHandler(async(req, _, next) => {
    try {
        const { user } = req;

        // Admins and moderators bypass verification check
        if(user.role === 'admin' || user.role === 'laundry-moderator'){
            return next();
        }

        if(!user.isVerified || user.verificationStatus !== 'approved'){
            throw new ApiError(403, "Your account is pending admin verification. Please wait for approval.");
        }

        next();
    } catch(err) {
        if(err instanceof ApiError) throw err;
        throw new ApiError(403, err?.message || "Account verification check failed");
    }
});
