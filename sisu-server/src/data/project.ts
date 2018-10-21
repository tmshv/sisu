import { ObjectId } from "bson";
import { Db } from "mongodb";
import { IProject } from "../core";
import { resourceQuery } from "../lib/db";

export async function findProject(db: Db, param: string | ObjectId): Promise<IProject> {
    return db.collection("projects").findOne(
        resourceQuery(param)
    );
}

export async function findProjectsById(db: Db, ids: ObjectId[]): Promise<IProject[]> {
    return db.collection("projects").find({
        _id: {$in: ids},
    }).toArray();
}