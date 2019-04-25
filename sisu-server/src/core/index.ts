import { ObjectId } from "bson";
import { IDataProvider } from "../application/types";

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
    dataProviders: ObjectId[];
    config: any;
    configData: string;
    lastState: IProjectState;
}

export interface IProjectFile {
    fileId: string;
    filename: string;
    log: object;
    tests: IFileTest[];
    previewImageUrl: string;
    lastScanTs: number;
}

export interface IFileTest {
    name: string;
    status: string;
    options: any;
    payload: any;
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
