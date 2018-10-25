import { ObjectId } from "bson";

export interface IUser {
    _id: ObjectId;
    email: string;
    password: string;
    salt: string;
    projects: ObjectId[];
}

export interface IProject {
    _id: ObjectId;
    version: string;
    name: string;
    uri: string;
    files: IProjectFile[];
    config: object;
    configData: string;
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
