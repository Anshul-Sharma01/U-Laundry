import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import cookieParser from "cookie-parser";

const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000,
    secure : true,
    httpOnly : true
}


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });
        return { accessToken, refreshToken };
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens");
    }
}

const registerUser = asyncHandler(async(req, res, next) => {
    try{
        const { username, name, email, fatherName, password, hostelName, roomNumber, degreeName } = req.body;

        if(!username || !email || !name || !fatherName || !password || !hostelName || !roomNumber || !degreeName){
            throw new ApiError(400, "All fields are mandatory");
        }

        const unameExists = await User.find({ username });
        if(unameExists){
            throw new ApiError(400, "Username already Exists");
        }
        
        const emailExists = await User.find({ email });
        if(email){
            throw new ApiError(400, "Email already Exists");
        }

        if(req.file){
            const localFilePath = req.file?.path;
            const avatar = await uploadOnCloudinary(localFilePath);
            
            if(!avatar){
                throw new ApiError(400, "File not uploaded !!");
            }

            const user = await User.create({
                username,
                name,
                email,
                fatherName,
                password,
                hostelName,
                roomNumber,
                degreeName,
                avatar : {
                    public_id : avatar.public_id,
                    secure_url : avatar.secure_url
                }
            })

            if(!user){
                throw new ApiError(400, 'User not registered !!');
            }

            return res.status(201).json(
                new ApiResponse(201, user, "User registered successfully")
            );

        }else{
            throw new ApiError(400, "Avatar file is required");
        }

    }catch(err){
        throw new ApiError(400, "Error occurred while registering new user..");
    }
})

const loginUser = asyncHandler(async(req, res, next) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            throw new ApiError(400, "All fields are mandatory");
        }

        const user = await User.findOne({ email });
        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if(!isPasswordValid){
            throw new ApiError(400, "Password is not correct");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user, refreshToken, accessToken }, "User logged in successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred while logging in user");
    }
})


export {
    registerUser,
    loginUser
}

