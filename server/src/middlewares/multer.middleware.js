import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Navigate one directory back
const parentDir = resolve(__dirname, "..");

// Navigate two directories back
const grandParentDir = resolve(__dirname, "../..");


const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, "./public/temp/");
    },
    filename : function(req, file, cb){
        cb(null, file.originalname + "-" + Date.now());
    }
})


export const upload = multer({
    storage
})


