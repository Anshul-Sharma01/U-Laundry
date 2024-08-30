import { asyncHandler } from "../utils/asyncHandler.js"



const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000,
    secure : true,
    httpOnly : true
}


const generateAccessAndRefreshTokens = async(userId) => {

}

const registerUser = asyncHandler(async(req, res, next) => {

})

const loginUser = asyncHandler(async(req, res, next) => {

})


export {
    registerUser,
    loginUser
}

