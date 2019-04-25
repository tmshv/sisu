import { ObjectId } from "bson";

export interface IDataProvider {
    _id: ObjectId;
    version: string;

    name: string;
    type: string;
    options: IWebdavDataProvider;
}

export interface IDataProviderFile {
    _id: ObjectId;
    fileId: string;
    type: string;
    filename: string;
    scanId: string;
    dataProviderId: ObjectId;
    lastModified: string;
    size: number;
    revision: string;
}

export interface IWebdavDataProvider {
    baseDir: string;
    host: string;
    auth: IUsernamePasswordCredentials;
}

export interface IAuth {
    type: string;
    auth: IUsernamePasswordCredentials;
}

export interface IUsernamePasswordCredentials {
    username: string;
    password: string;
}
