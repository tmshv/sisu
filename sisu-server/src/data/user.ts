import { Db } from "mongodb";
import { IUser } from "../core";

export async function findUserByEmail(db: Db, email: string): Promise<IUser> {
    const user = await db.collection("users").findOne({
        email,
    });

    return user as IUser;
}
