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


// File type whitelist — only allow images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed"), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
        files: 1,
    },
    fileFilter,
})


