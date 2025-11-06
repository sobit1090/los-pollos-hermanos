import multer from "multer";
import path from "path";

const storage = multer.diskStorage({});

export const singleUpload = multer({ storage }).single("photo");
