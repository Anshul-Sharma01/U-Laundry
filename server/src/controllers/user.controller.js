import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model.js";


const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000,
    secure : process.env.NODE_ENV === 'production',
    httpOnly : true,
    sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId).select("+role");
        if(!user){
            throw new ApiError(404, "User not found while generating tokens");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });
        return { accessToken, refreshToken };
    }catch(err){
        if(err instanceof ApiError) throw err;
        console.error(`Error generating tokens: ${err}`);
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens");
    }
}

const registerUser = asyncHandler(async(req, res) => {
    const { username, name, email, fatherName, password, hostelName, roomNumber, degreeName, studentId } = req.body;

    if(!username || !email || !name || !fatherName || !password || !hostelName || !roomNumber || !degreeName || !studentId){
        throw new ApiError(400, "All fields are mandatory");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }, { studentId: Number(studentId) }] });
    if (existingUser) {
        if(existingUser.email === email) throw new ApiError(409, "Email already exists");
        if(existingUser.username === username) throw new ApiError(409, "Username already exists");
        throw new ApiError(409, "Student ID already exists");
    }

    if(!req.file){
        throw new ApiError(400, "Avatar file is required");
    }

    const localFilePath = req.file.path;
    const avatar = await uploadOnCloudinary(localFilePath);
    
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar to cloud storage");
    }

    let user;
    try {
        user = await User.create({
            username,
            name,
            email,
            fatherName,
            password,
            hostelName,
            roomNumber,
            degreeName,
            studentId : Number(studentId),
            avatar : {
                public_id : avatar.public_id,
                secure_url : avatar.secure_url
            }
        });
    } catch(err) {
        // If user creation fails, clean up the uploaded avatar
        await deleteFromCloudinary(avatar.public_id);
        
        // Handle mongoose validation errors
        if(err.name === 'ValidationError'){
            const messages = Object.values(err.errors).map(e => e.message).join(', ');
            throw new ApiError(400, messages);
        }
        // Handle duplicate key errors
        if(err.code === 11000){
            const field = Object.keys(err.keyPattern)[0];
            throw new ApiError(409, `${field} already exists`);
        }
        throw new ApiError(500, "Failed to register user");
    }

    // Remove password from response
    const createdUser = await User.findById(user._id);

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
})

const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password +role");
    if(!user){
        return res.status(400).json(
            new ApiResponse(400, {}, "User does not exist")
        );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        return res.status(400).json(
            new ApiResponse(400, {}, "Incorrect password")
        );
    }

    // Generate OTP using the dedicated Otp model
    const plainOtp = await Otp.generateOtp(email, 'login', 2);

    await sendEmail(
        user.email,
        "U-Laundry Login OTP",
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">U-Laundry Verification</h2>
            <p style="color: #555; font-size: 16px;">Your login verification code is:</p>
            <div style="background: #f4f4f4; padding: 15px 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${plainOtp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This code expires in 2 minutes. Do not share it with anyone.</p>
        </div>`
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification code sent to your email")
    );
})

const verifyVerificationCode = asyncHandler(async(req, res) => {
    const { verifyCode, email } = req.body;

    if(!verifyCode || !email){
        throw new ApiError(400, "Email and verification code are required");
    }

    const user = await User.findOne({ email }).select("+role");
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    // Verify OTP using the dedicated Otp model
    const result = await Otp.verifyOtp(email, String(verifyCode), 'login');

    if(!result.success){
        return res.status(400).json(
            new ApiResponse(400, {}, result.message)
        );
    }

    // OTP verified — generate tokens and log the user in
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Fetch the clean user object for response
    const loggedInUser = await User.findById(user._id).select("+role");

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user: loggedInUser, refreshToken, accessToken }, "User logged in successfully")
        );
})

const requestNewVerificationCode = asyncHandler(async(req, res) => {
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    // Generate a new OTP using the dedicated Otp model
    const plainOtp = await Otp.generateOtp(email, 'login', 2);

    await sendEmail(
        user.email,
        "U-Laundry New Verification Code",
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">U-Laundry Verification</h2>
            <p style="color: #555; font-size: 16px;">Your new verification code is:</p>
            <div style="background: #f4f4f4; padding: 15px 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${plainOtp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This code expires in 2 minutes. Do not share it with anyone.</p>
        </div>`
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "New verification code sent successfully")
    );
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set : { refreshToken : null } },
        { new : true }
    );

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
})

const getProfile = asyncHandler(async (req, res) => {
    // req.user is already hydrated by the hydrateAuth middleware
    return res.status(200).json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    );
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json(
            new ApiResponse(400, {}, "Email not registered")
        );
    }

    const resetToken = await user.generatePasswordResetToken();
    await user.save({ validateBeforeSave : false });

    const resetPasswordURL = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

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
        Thank you,<br>U-Laundry 
    </p>`;

    try{
        await sendEmail(email, subject, message);
        return res.status(200).json(
            new ApiResponse(200, {}, `Reset password link has been sent to ${email} successfully`)
        );
    }catch(err){
        // Clean up reset token on email failure
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({ validateBeforeSave : false });
        console.error(`Error sending password reset email: ${err}`);
        throw new ApiError(500, "Error occurred while sending reset password email");
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    if(!password){
        throw new ApiError(400, "New password is required");
    }

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        forgotPasswordExpiry : { $gt : Date.now() },
        forgotPasswordToken 
    });

    if(!user){
        return res.status(400).json(
            new ApiResponse(400, {}, "Token is invalid or expired")
        );
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    
    // IMPORTANT: Do NOT use validateBeforeSave: false here
    // The pre('save') hook must run to hash the password
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
})

const changePassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Both old and new passwords are required");
    }

    if(oldPassword === newPassword){
        throw new ApiError(400, "New password must be different from old password");
    }

    const user = await User.findById(userId).select("+password");
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        return res.status(400).json(
            new ApiResponse(400, {}, "Incorrect old password")
        );
    }

    user.password = newPassword;
    // Let the pre-save hook hash the password
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
})

const updateUserDetails = asyncHandler(async(req, res) => {
    const { username, name } = req.body;
    const userId = req.user._id;

    if(!username && !name){
        throw new ApiError(400, "At least one field (username or name) is required");
    }

    const updationData = {};
    
    if(username) { 
        const userNameExists = await User.findOne({ username, _id: { $ne: userId } });
        if(userNameExists){
            return res.status(409).json(
                new ApiResponse(409, {}, "Username already exists")
            );
        }
        updationData.username = username;
    } 
    if(name){
        updationData.name = name;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set : updationData },
        { new : true, runValidators : true }
    );

    if(!user){
        throw new ApiError(500, "Failed to update user details");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Details updated successfully")
    );
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const userId = req.user._id;

    if(!req.file){
        throw new ApiError(400, "Avatar file is required");
    }

    const localFilePath = req.file.path;
    if(!localFilePath){
        throw new ApiError(400, "Avatar file upload failed");
    }

    const avatar = await uploadOnCloudinary(localFilePath);
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar to cloud storage");
    }

    const user = await User.findById(userId);
    if(!user){
        // Clean up the newly uploaded avatar since user doesn't exist
        await deleteFromCloudinary(avatar.public_id);
        throw new ApiError(404, "User not found");
    }

    // Delete old avatar from Cloudinary
    if(user.avatar?.public_id){
        await deleteFromCloudinary(user.avatar.public_id);
    }

    user.avatar = {
        public_id : avatar.public_id,
        secure_url : avatar.secure_url
    };
    
    await user.save({ validateBeforeSave : false });

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request — no refresh token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch(err) {
        throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");
    if(!user){
        throw new ApiError(401, "Invalid refresh token — user not found");
    }

    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Refresh token has been revoked or already used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully")
        );
})


const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});

    return res.status(200).json(
        new ApiResponse(200, users, users.length === 0 ? "No users found" : "Users fetched successfully")
    );
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // Clean up user's avatar from Cloudinary
    if(user.avatar?.public_id){
        await deleteFromCloudinary(user.avatar.public_id);
    }

    // Clean up user's orders
    await Order.deleteMany({ user: userId });

    // Clean up user's OTPs
    await Otp.deleteMany({ email: user.email });

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, { _id: userId }, "User and associated data deleted successfully")
    );
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
