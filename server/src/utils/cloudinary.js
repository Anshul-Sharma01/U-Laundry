import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

import { config } from "dotenv";
config({ path: "./.env" });


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async( localFilePath ) => {
    try{    
        if(!localFilePath){
            console.log('Local file path not given !!');
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        }).catch((err) => {
            console.log(`Cloudinary error : ${err.message}`);
        })

        // Clean up local temp file after upload (success or partial failure)
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;

    }catch(err){
        console.log("Error in cloudinary : ", err.message);
        // Clean up local temp file on error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
} 



const deleteFromCloudinary = async ( pathId ) => {
    try{
        const response = await cloudinary.uploader.destroy(
            pathId, {
                invalidate : true,
                resource_type : "image"
            }
        )

        return response;
    }catch(err){
        console.log(`Error occurred while deleting file from cloudinary : ${err.message}`);
        return null;
    }
}



export {
    uploadOnCloudinary,
    deleteFromCloudinary
}
