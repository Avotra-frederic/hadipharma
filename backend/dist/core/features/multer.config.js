"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPrescription = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + "-" + node_path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedPdf = /pdf/;
    const extname = allowedImageTypes.test(node_path_1.default.extname(file.originalname).toLowerCase()) || allowedPdf.test(node_path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype) || allowedPdf.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Only images and PDF files are allowed"));
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter });
const uploadSingle = upload.single("photo");
exports.uploadSingle = uploadSingle;
const uploadPrescription = upload.single("prescription");
exports.uploadPrescription = uploadPrescription;
const uploadMultiple = upload.array("photos", 5);
exports.uploadMultiple = uploadMultiple;
