import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";



export const verifyJWT = asyncHandler( async (req, _, next) => {
    try{
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer", " ");

        // console.log("Token from frontend : ", token);

        if(!token){
            throw new ApiError(403, "Unauthorized request");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // console.log("Decoded token : ", decodedToken);

        const user = await User.findById(decodedToken?._id).select("+role");

        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
        // console.log("User inserted by jwt : ", user);


        req.user = user;
        next();

    }catch(err){
        console.error(`Error occurred while verifying jwt : ${err}`);
        throw new ApiError(401, err?.message || "Invalid access Token");
    }
})




export const verifyModerator = asyncHandler(async(req, _ , next) => {
    try{
        const { user } = req;

        // console.log(user);

        if(!user || user.role != 'laundary-moderator'){
            throw new ApiError(403, "Access forbidden");
        }

        next();

    }catch(err){
        throw new ApiError(403, err?.message || "Access to this particular route is forbidden");
    }
})
