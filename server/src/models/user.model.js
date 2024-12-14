import mongoose, { Schema } from "mongoose";
import { Order } from "./order.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type } from "os";

const userSchema = new Schema({
    username : {
        type : String,
        required : [true, "Username is required"],
        unique : [true, "Username must be unique"],
        minLength : [10, "Username must be of atleast 10 characters"],
        trim : true
    },
    studentId : {
        type : Number,
        required : [true, "Student-Id is required"],
        unique : [true, "Student Id must be unique"]
    },
    name : {
        type : String,
        required : [true, "Name is required"]
    },
    fatherName : {
        type : String,
        required : [true, "Father's name is required"]
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : [true, "Email must be unique"],
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        match : [/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,"Password must contain at least one letter, one number, and one special character"],
        select : false,
    },
    hostelName : {
        type : String,
        enum : ['BOSE','ARYABHATTA','SARABHAI','CHANKAYA','TERESA','GARGI','KALPANA'],
        required : [true, "Hostel name is required !!"],
    },
    roomNumber : {
        type : String,
        required : [true, "Room number is required"],
    },
    avatar : {
        public_id : {
            type : String,
            required : true,
        },
        secure_url : {
            type : String,
            required : true
        }
    },
    degreeName : {
        type : String,
        enum : ['BCA','BE','PHARMA', 'NURS'],
        default : 'BE',
        required : [true, "Degree Name is required"]
    },
    role : {
        type : String,
        enum : ['student', 'admin', 'laundary-moderator', 'guest'],
        default : 'student',
        select : false
    },
    history : [
        {
            type : Schema.Types.ObjectId,
            ref : "Order",
            required : true
        }
    ],
    refreshToken : {
        type : String,
        select : false
    },
    verifyCode : {
        type : Number,
    },
    forgotPasswordToken : String,
    forgotPasswordExpiry : Date,
    
},{
    timestamps : true
})


userSchema.pre('save', async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
})

userSchema.methods = {
    generateAccessToken : function(){
        return jwt.sign(
            {
                _id : this._id,
                email : this.email,
                username : this.username,
                role : this.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    },

    generateRefreshToken : function(){
        return jwt.sign(
            {
                _id : this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    },

    isPasswordCorrect : async function (password) {
        if(!password || typeof password !== "string"){
            throw new Error("Password must be a string !!");
        }
        return await bcryptjs.compare(password, this.password);
    },

    generatePasswordResetToken : async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
        return resetToken;
    }
}



export const User = mongoose.model('User', userSchema);

