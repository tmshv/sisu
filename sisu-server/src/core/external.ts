export interface IFile {
    file: string;
    fileId: string;
    type: string;
    buildStatus: string;
}

export interface IProjectInfo {
    name: string;
    id: string;
    uri: string;
    files: IFile[];
}

export interface IExternalUser {
    id: string;
    email: string;
    projects: IProjectInfo[];
}
