import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";


const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000,
    secure : true,
    httpOnly : true
}

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
        console.error(`Error occurred while generating refresha nd access token : ${err}`);
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens");
    }
}

const registerUser = asyncHandler(async(req, res, next) => {
    try{
        const { username, name, email, fatherName, password, hostelName, roomNumber, degreeName } = req.body;

        if(!username || !email || !name || !fatherName || !password || !hostelName || !roomNumber || !degreeName){
            throw new ApiError(400, "All fields are mandatory");
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new ApiError(400, existingUser.email === email ? "Email already exists" : "Username already exists");
        }


        if(req.file){
            const localFilePath = req.file?.path;
            console.log("req-file : ", req.file );
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
                await deleteFromCloudinary(avatar?.public_id);
                throw new ApiError(400, 'User not registered !!');
            }

            return res.status(201).json(
                new ApiResponse(201, user, "User registered successfully")
            );

        }else{
            throw new ApiError(400, "Avatar file is required");
        }

    }catch(err){
        console.error(`Error occurred while registering a new user : ${err}`);
        throw new ApiError(400, "Error occurred while registering new user..");
    }
})

const loginUser = asyncHandler(async(req, res, next) => {
    try{
        const { email, password } = req.body;
        // console.log("studenntDetails : ", email, password);

        if(!email || !password){
            throw new ApiError(400, "All fields are mandatory");
        }

        const user = await User.findOne({email}).select("+password");
        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if(!isPasswordValid){
            throw new ApiError(400, "Password is not correct");
        }

        const verificationCode = generateVerificationCode();
        user.verifyCode = verificationCode;
        user.verifyCodeExpiry = Date.now() + 2 * 60 * 1000; //code expiry is set to 2 minutes from now

        await sendEmail(
            user.email,
            "U-Laundry Login OTP",
            `<p>Your verification code is <strong>${verificationCode}</strong>. Please enter it to verify your account.</p>`
        )

        await user.save({ validateBeforeSave : false });
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User Authenticated Successfully"
            )
        )


    }catch(err){
        console.error(`Error occurred while logging in user : ${err}`);
        throw new ApiError(400, "Error occurred while logging in user");
    }
})

const verifyVerificationCode = asyncHandler(async(req, res, next) => {
    try{
        const { verifyCode, email } = req.body;
        // console.log("Verifycode : ", verifyCode, email);
        const user = await User.findOne({email});

        if(!user){
            throw new ApiError("Request User does not exists !!");
        }

        if(user.verifyCode === verifyCode && user.verifyCodeExpiry > Date.now()){

            user.verifyCode = null;
            user.verifyCodeExpiry = null;
            user.isCodeVerified = true;

        
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

            await user.save({ validateBeforeSave : false });

            return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { user, refreshToken, accessToken }, "User logged in successfully")
            );
        }

        
        return res.status(400)
        .json(
            new ApiResponse(
                400,
                {},
                "Invalid or expired Verification code"
            )
        )
        
    }catch(err){
        console.error(`Error occurred while verifying verification code : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while verifying verification code !!");
    }
})

const requestNewVerificationCode = asyncHandler(async(req, res, next) => {
    try{
        const { email } = req.body;
        // console.log("Email : ", email);
        const user = await User.findOne({email});

        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const newVerificationCode = generateVerificationCode();
        user.verifyCode = newVerificationCode;
        user.verifyCodeExpiry = Date.now() + 2 * 60 * 1000;

        await sendEmail(
            user.email,
            "U-Laundry New Verification Code",
            `<p>Your new verification code is <strong>${newVerificationCode}</strong>. Please enter it to verify your account.</p>`
        );

        await user.save({ validateBeforeSave : false });

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "New Verification code sent successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while requesting new verification code : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while requesting new verification code !!");
    }
})

const logout = asyncHandler(async (req, res, next) => {
    try{
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    refreshToken : null
                }
            },
            {
                new : true
            }
        )

        user.isCodeVerified = false;
        await user.save({ validateBeforeSave : false });

        return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(
            new ApiResponse(200, {}, "User logged Out successfully")
        );
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while logging out");
    }
})

const getProfile = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user._id;
        const user = await User.findById(userId);

        return res.status(200)
        .json(new ApiResponse(200, user, "User Profile fetched successfully"));
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching user profile");
    }
})

const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if(!user){
        throw new ApiError(400, "Email not registered");
    }

    const resetToken = await User.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

    const subject = "Reset Password Token";
    const message = `<p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        Hello,
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        We received a request to reset your password. You can easily reset it by clicking the button below:
    </p>
    <p style="text-align: center;">
        <a href="${resetPasswordURL}" target="_blank" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 16px;">Reset Your Password</a>
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        If the above button doesn't work, copy and paste the following link into your browser:
    </p>
    <p style="font-family: Arial, sans-serif; color: #007BFF; word-wrap: break-word; font-size: 16px;">
        <a href="${resetPasswordURL}" target="_blank" style="color: #007BFF; text-decoration: underline;">${resetPasswordURL}</a>
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        If you did not request a password reset, please ignore this message. The link is valid for 15 minutes only.
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        Thank you,<br>U - Laundary 
    </p>`

    try{
        await sendEmail(email, subject, message);
        return res.status(200)
        .json(
            new ApiResponse(200, {}, `Reset Password has been sent to ${email} successfully`)
        );
    }catch(err){
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        throw new ApiError(400, err?.message || "Error occurred while sending Reset Token");
    }
})

const resetPassword = asyncHandler(async (req, res, next) => {
    try{
        const { resetToken } = req.params;
        const { password } = req.body;

        const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            forgotPasswordExpiry : { $gt : Date.now() },
            forgotPasswordToken 
        })

        if(!user){
            throw new ApiError(400, "Token is invalid or expired, please try again");
        }

        user.password = password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, {}, "Password changed successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred in updating new password");
    }
})

const changePassword = asyncHandler(async(req, res, next) => {
    try{
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;
        // console.log("Passwords :", oldPassword, newPassword);

        if(!oldPassword || !newPassword){
            throw new ApiError(400, "All fields are mandatory");
        }

        const user = await User.findById(userId).select("+password");

        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordValid){
            throw new ApiError(400, "Invalid Old Password");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave : false });

        user.password = undefined;
        return res.status(200)
        .json(
            new ApiResponse(200, user, "Password changed successfully")
        );

    }catch(err){
        console.log("Error occurred while changing the password : ", err);
        throw new ApiError(400, "Error occurred while changing the password");
    }
})

const updateUserDetails = asyncHandler(async(req, res, next ) => {
    try{
        const { hostelName, roomNumber } = req.body;
        const userId = req.user._id;

        if(!hostelName && !roomNumber){
            throw new ApiError(400, "Atleast one field is necessary");
        }
        const updationData = {}
        if(hostelName) { 
            updationData.hostelName = hostelName;
        } 
        if(roomNumber){
            updationData.roomNumber = roomNumber;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set : updationData },
            { new : true }
        )

        if(!user){
            throw new ApiError(400, "Some error occurred while updating..");
        }

        return res.status(200).json(new ApiResponse(200, user, "Details updated successfully"));

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating user details !");
    }
})

const updateUserAvatar = asyncHandler(async(req, res, next) => {
    try{
        
        const userId = req.user._id;

        if(req.file){
            const localFilePath = req.file?.path;
            if(!localFilePath){
                throw new ApiError(400, "Avatar file is not uploaded");
            }

            const avatar = await uploadOnCloudinary(localFilePath);
            if(!avatar){
                throw new ApiError(400, "Avatar file is not updated !!");
            }

            const user = await User.findById(userId);

            await deleteFromCloudinary(user.avatar.public_id);

            user.avatar = {
                public_id : avatar.public_id,
                secure_url : avatar.secure_url
            }
            
            await user.save();

            return res.status(200)
            .json(
                new ApiResponse(200, user, "Avatar file is uploaded successfully")
            );

        }else{
            throw new ApiError(400, "Avatar file is required");
        }
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating user avatar..");
    }
})

const refreshAccessToken = asyncHandler(async(req, res, next) => {
    try{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid refresh Token");
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken
                },
                "Access Token refreshed successfully"
            )
        )


    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating access Token")
    }
})



const getAllUsers = asyncHandler(async (req, res, next) => {
    try{
        const users = await User.find({});

        if(users.length === 0){
            return res.status(200).json(
                new ApiResponse(200, {}, "Users not found")
            );
        }

        return res.status(200)
        .json(
            new ApiResponse(200, users, "Users fetched successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred while fetching all Users");
    }
})

const deleteUser = asyncHandler(async (req, res, next) => {
    try{
        const { userId } = req.params;
        
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User Id");
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if(!deletedUser){
            throw new ApiError(404, "User not found");
        }

        return res.status(200)
        .json(
            new ApiResponse(200, deletedUser, "User deleted successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred while deleting  user");
    }
})


export {
    registerUser,
    loginUser,
    verifyVerificationCode,
    requestNewVerificationCode,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUserDetails,
    updateUserAvatar,
    refreshAccessToken,
    getAllUsers,
    deleteUser
}

