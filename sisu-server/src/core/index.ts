import { ObjectId } from "bson";

export interface IUser {
    email: string;
    password: string;
    salt: string;
}

export interface IProject {
    _id: ObjectId;
    version: string;
    name: string;
    uri: object;
    files: IProjectFile[];
    config: object;
    lastState: IProjectState;
}

export interface IProjectFile {
    filename: string;
    log: object;
    previewImageUrl: string;
    lastScanTs: number;
}

export interface IProjectState {
    projectFilenames: string[];
    lastScanTs: number;
    workerAppVersion: string;
}
