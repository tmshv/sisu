import ignore from "ignore";
import { DATA_TOKEN, DATA_URL_BASE } from "../util/secrets";
import { IDataProviderFile } from "./types";

export const createFileContentUrl = (fileId: string) => {
    return `${DATA_URL_BASE}/files/${fileId}/content?token=${DATA_TOKEN}`;
};

export const createFileMetadataUrl = (fileId: string) => {
    return `${DATA_URL_BASE}/files/${fileId}/metadata?token=${DATA_TOKEN}`;
};

export const createProviderMetadataUrl = (dataProviderId: string) => {
    return `${DATA_URL_BASE}/providers/${dataProviderId}/files/metadata?token=${DATA_TOKEN}`;
};

export function makeRelative(path: string): string {
    if (path.charAt(0) === "/") {
        return path.substr(1);
    }

    return path;
}

export function filterIgnore(files: IDataProviderFile[], include: boolean, ignorePattern: string[]): IDataProviderFile[] {
    const ig = ignore().add(ignorePattern);

    return files.filter(file => {
        const f = ig.ignores(makeRelative(file.filename));

        if (include) {
            return f;
        }

        return !f;
    });
}

