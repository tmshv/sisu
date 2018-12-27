import { Request, Response } from "express";
import { resource } from "../lib/api";
import { createFileId } from "../core/lib/file";

export function getProjectFileId() {
    return async (req: Request, res: Response) => {
        const file = req.query.file;
        const fileId = createFileId(file);

        return res.json(resource(fileId));
    };
}
