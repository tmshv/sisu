import { IProject, IUser } from ".";
import { IProjectInfo, IExternalUser } from "./external";

export function createProjectInfo(project: IProject): IProjectInfo {
    return {
        name: project.name,
        id: `${project._id}`,
        uri: project.uri,
        files: project.lastState.files.map(x => ({
            file: x.file,
            fileId: x.fileId,
            type: x.type,
        })),
    };
}

export function createExternalUser(user: IUser, projects: IProject[]): IExternalUser {
    return {
        id: `${user._id}`,
        email: user.email,
        projects: projects.map(createProjectInfo)
    };
}