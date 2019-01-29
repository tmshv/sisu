export interface IFileTest {
    status: string;
    name: string;
    payload: any;
    options: any;
}

export interface IFile {
    fileId: string;
    filename: string;
    tests: IFileTest[];
}

export interface IProjectInfoFile {
    file: string;
    fileId: string;
    type: string;
    buildStatus: string;
}

export interface IProjectInfo {
    name: string;
    uri: string;
    id: string;
    files: IProjectInfoFile[];
}

export interface IUserInfo {
    email: string;
}
