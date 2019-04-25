import crypto from "crypto";
import { IMGPROXY_KEY, IMGPROXY_SALT } from "../util/secrets";

const urlSafeBase64 = (value: string | Buffer) => {
    const buf: Buffer = value instanceof Buffer
        ? value
        : new Buffer(value);

    return buf.toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};
const hexDecode = (hex: string) => Buffer.from(hex, "hex");
const sign = (salt: string, target: string, secret: string) => {
    const hmac = crypto.createHmac("sha256", hexDecode(secret));
    hmac.update(hexDecode(salt));
    hmac.update(target);

    return urlSafeBase64(hmac.digest());
};

type Options = {
    url: string,
    resizing_type: "fit" | "fill" | "crop",
    width: number,
    height: number,
    gravity: "no" | "so" | "ea" | "we" | "noea" | "nowe" | "soea" | "sowe" | "ce" | "sm" | string,
    enlarge: boolean,
    extension: string,
};
export function signImgproxyUrl({
    url,
    resizing_type,
    width,
    height,
    gravity,
    enlarge,
    extension,
}: Options) {
    const enlargeValue = enlarge ? 1 : 0;
    const encoded_url = urlSafeBase64(url);
    const path = `/${resizing_type}/${width}/${height}/${gravity}/${enlargeValue}/${encoded_url}.${extension}`;
    const signature = sign(IMGPROXY_SALT, path, IMGPROXY_KEY);

    return `/${signature}${path}`;
}