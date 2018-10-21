import crypto from "crypto";
import { IUser } from "../core";

export function matchPassword(password: string, user: IUser): boolean {
    const sample = user.salt + password;
    const shasum = crypto.createHash("sha256").update(sample);
    const hash = shasum.digest("hex");

    return hash === user.password;
}