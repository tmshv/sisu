export interface IProjectInfo {
    name: string;
    id: string;
    uri: string;
    files: string[];
}

export interface IExternalUser {
    id: string;
    email: string;
    projects: IProjectInfo[];
}
