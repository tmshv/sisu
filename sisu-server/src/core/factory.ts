import { IProject, IUser, IProjectFile, IFileMetadata } from ".";
import { IProjectInfo, IExternalUser } from "./external";
import { normalizePath } from "../util";
import { array } from "../util/array";

export function createProjectInfo(project: IProject): IProjectInfo {
    const files = project.files;

    return {
        name: project.name,
        id: `${project._id}`,
        uri: project.uri,
        files: project.lastState.files.map(x => {
            const file = getProjectFileById(files, x.fileId);

            return ({
                file: x.file,
                fileId: x.fileId,
                type: x.type,
                buildStatus: getBuildStatus(file),
            });
        }),
    };
}

export function createProjectFile(file: IProjectFile): IProjectFile {
    return {
        ...file,
        filename: normalizePath(file.filename),
    };
}

export function getProjectFileById(files: IProjectFile[], fileId: string): IProjectFile {
    return files.find(f => f.fileId === fileId);
}

export function getBuildStatus(file: IProjectFile): string {
    return array(file.tests).reduce(
        (status: string, test) => {
            if (test.status === "fail") {
                return test.status;
            }

            return status;
        },
        "pass",
    );
}

export function createExternalUser(user: IUser, projects: IProject[]): IExternalUser {
    return {
        id: `${user._id}`,
        email: user.email,
        projects: projects.map(createProjectInfo)
    };
}