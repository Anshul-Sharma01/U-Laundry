import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

const otpSchema = new Schema({
    email : {
        type : String,
        required : [true, "Email is required"],
        index : true,
        lowercase : true,
        trim : true
    },
    otp : {
        type : String,
        required : [true, "OTP is required"],
    },
    purpose : {
        type : String,
        enum : ['login', 'email-verification', 'password-reset'],
        required : [true, "OTP purpose is required"],
        default : 'login'
    },
    expiresAt : {
        type : Date,
        required : true,
        index : { expires : 0 } // TTL index — MongoDB auto-deletes when expiresAt is reached
    },
    attempts : {
        type : Number,
        default : 0
    },
    isUsed : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
});


// Compound index for efficient lookups
otpSchema.index({ email : 1, purpose : 1, isUsed : 1 });


// Hash OTP before saving
otpSchema.pre('save', async function () {
    if(!this.isModified("otp")) return;
    this.otp = await bcryptjs.hash(this.otp, 10);
});


/**
 * Generate a new OTP for the given email and purpose.
 * Invalidates all previous unused OTPs for the same email + purpose combo.
 * @param {string} email 
 * @param {string} purpose - 'login' | 'email-verification' | 'password-reset'
 * @param {number} ttlMinutes - OTP validity in minutes (default: 2)
 * @returns {Promise<string>} The plaintext OTP code
 */
otpSchema.statics.generateOtp = async function(email, purpose = 'login', ttlMinutes = 2) {
    // Invalidate all previous unused OTPs for this email + purpose
    await this.updateMany(
        { email : email.toLowerCase(), purpose, isUsed : false },
        { $set : { isUsed : true } }
    );

    // Generate a 6-digit numeric OTP
    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the OTP document (pre-save hook will hash it)
    await this.create({
        email : email.toLowerCase(),
        otp : plainOtp,
        purpose,
        expiresAt : new Date(Date.now() + ttlMinutes * 60 * 1000)
    });

    return plainOtp;
};


/**
 * Verify an OTP for the given email and purpose.
 * @param {string} email 
 * @param {string} plainCode - The plaintext OTP to verify
 * @param {string} purpose - 'login' | 'email-verification' | 'password-reset'
 * @returns {Promise<{success: boolean, message: string}>}
 */
otpSchema.statics.verifyOtp = async function(email, plainCode, purpose = 'login') {
    const otpDoc = await this.findOne({
        email : email.toLowerCase(),
        purpose,
        isUsed : false,
        expiresAt : { $gt : new Date() }
    }).sort({ createdAt : -1 }); // Get the most recent valid OTP

    if(!otpDoc){
        return { success : false, message : "OTP has expired or does not exist. Please request a new one." };
    }

    // Check attempts limit (max 5)
    if(otpDoc.attempts >= 5){
        otpDoc.isUsed = true;
        await otpDoc.save({ validateBeforeSave : false });
        return { success : false, message : "Too many failed attempts. Please request a new OTP." };
    }

    // Increment attempt count
    otpDoc.attempts += 1;

    // Compare the plaintext OTP against the hash
    const isMatch = await bcryptjs.compare(plainCode, otpDoc.otp);

    if(!isMatch){
        await otpDoc.save({ validateBeforeSave : false });
        return { success : false, message : `Invalid OTP. ${5 - otpDoc.attempts} attempts remaining.` };
    }

    // OTP is valid — mark as used
    otpDoc.isUsed = true;
    await otpDoc.save({ validateBeforeSave : false });

    return { success : true, message : "OTP verified successfully." };
};


export const Otp = mongoose.model('Otp', otpSchema);
