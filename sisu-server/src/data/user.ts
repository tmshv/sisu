import { Db } from "mongodb";
import { IUser } from "../core";
import { findProjectsById } from "./project";
import { IExternalUser } from "../core/external";
import { createExternalUser } from "../core/factory";

export async function findUserByEmail(db: Db, email: string): Promise<IUser> {
    const user = await db.collection("users").findOne({
        email,
    });

    return user as IUser;
}

export async function findExternalUser(db: Db, user: IUser): Promise<IExternalUser> {
    const projects = await findProjectsById(db, user.projects);

    return createExternalUser(user, projects);
}