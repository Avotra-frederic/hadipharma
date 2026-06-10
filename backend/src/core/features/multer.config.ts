import { Request } from "express";
import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, "uploads/");
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
            cb(null,file.fieldname + "-" + uniqueSuffix + "-" + path.extname(file.originalname));
        }
    }

);

const fileFilter = (req:Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedPdf = /pdf/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) || allowedPdf.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype) || allowedPdf.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only images and PDF files are allowed"));
    }
}

const upload = multer({ storage, fileFilter });
const uploadSingle = upload.single("photo");
const uploadPrescription = upload.single("prescription");
const uploadMultiple = upload.array("photos", 5);

export { uploadSingle, uploadMultiple, uploadPrescription };