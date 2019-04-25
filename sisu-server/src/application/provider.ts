import { DATA_TOKEN, DATA_URL_BASE } from "../util/secrets";

export const createFileContentUrl = (fileId: string) => {
    return `${DATA_URL_BASE}/files/${fileId}/content?token=${DATA_TOKEN}`;
};

export const createFileMetadataUrl = (fileId: string) => {
    return `${DATA_URL_BASE}/files/${fileId}/metadata?token=${DATA_TOKEN}`;
};

export const createProviderMetadataUrl = (dataProviderId: string) => {
    return `${DATA_URL_BASE}/providers/${dataProviderId}/files/metadata?token=${DATA_TOKEN}`;
};
