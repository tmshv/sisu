interface File {
    file: string;
    fileId: string;
    type: string;
}

export interface IProjectInfo {
    name: string;
    id: string;
    uri: string;
    files: File[];
}

export interface IExternalUser {
    id: string;
    email: string;
    projects: IProjectInfo[];
}
