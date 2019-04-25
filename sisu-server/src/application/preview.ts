import { signImgproxyUrl, createImgproxyUrl } from "../lib/imgproxy";
import { IDataProviderFile } from "./types";
import { IFileMetadata } from "../core";
import { createFileContentUrl } from "./provider";

export function createPreview(file: IFileMetadata | IDataProviderFile): any {
    if (file.type === "image/jpeg") {
        const width = 1280;
        const height = 800;
        const sourceUrl = createFileContentUrl(file.fileId);
        const imgproxyPath = signImgproxyUrl({
            url: sourceUrl,
            resizing_type: "fill",
            gravity: "no",
            enlarge: false,
            extension: "jpg",
            width,
            height,
        });

        return [
            {
                type: "image",
                name: "native",
                options: {
                    src: createImgproxyUrl(imgproxyPath),
                    width,
                    height,
                },
            },
        ];
    }

    return null;
}