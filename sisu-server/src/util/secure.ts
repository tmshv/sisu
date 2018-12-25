import crypto from "crypto";
import { IUser } from "../core";
import shorthash from "shorthash";

export function matchPassword(password: string, user: IUser): boolean {
    const sample = user.salt + password;
    const shasum = crypto.createHash("sha256").update(sample);
    const hash = shasum.digest("hex");

    return hash === user.password;
}

export function createShortHash(input: string): string {
    return shorthash.unique(input);
}
