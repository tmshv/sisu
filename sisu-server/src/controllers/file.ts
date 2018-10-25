import { Request, Response, NextFunction } from "express";
import multer from "multer";
import crypto from "crypto";
import { resource, errorMessage } from "../lib/api";
import { UPLOAD_DIR } from "../util/secrets";
import { UPLOAD_PUBLIC_PATH } from "../util/secrets";

function getFilename(cb: any) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) {
            return cb(err, undefined);
        }

        return cb(undefined, raw.toString("hex"));
    });
}

function getFileExtention(file: any) {
    if (file.mimetype === "image/jpeg") {
        return ".jpg";
    }

    if (file.mimetype === "image/png") {
        return ".png";
    }

    return "";
}

export function createFile(formField: string, options?: any) {
    const storage = multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: function (req: Request, file: any, cb: any) {
            getFilename((err: any, name: string) => {
                if (err) {
                    return cb(err, undefined);
                }

                const filename = name + getFileExtention(file);
                return cb(undefined, filename);
            });
        }
    });

    return multer({ storage }).single(formField);
}

export function postUpload() {
    return async (req: Request, res: Response, next: NextFunction) => {
        // {
        //   fieldname: 'file',
        //   originalname: '17.jpg',
        //   encoding: '7bit',
        //   mimetype: 'image/jpeg',
        //   destination: 'static/uploads/',
        //   filename: 'bf6075170b34eca67514e4b734819482',
        //   path: 'static/uploads/bf6075170b34eca67514e4b734819482',
        //   size: 351322,
        // }

        if (!req.file) {
            return res.status(400).json(errorMessage("Cannot save file"));
        }

        const filepath = `${UPLOAD_PUBLIC_PATH}${req.file.filename}`;

        return res.json(resource(filepath));
    };
}
