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
    config: any;
    configData: string;
    lastState: IProjectState;
}

export interface IProjectFile {
    filename: string;
    log: object;
    previewImageUrl: string;
    lastScanTs: number;
}

export interface IFileMetadata {
    fileId: string;
    file: string;
    hash: string;
    type: string;
}

export interface IProjectState {
    files: IFileMetadata[];
    lastScanTs: number;
    workerAppVersion: string;
}
