import { IProject, IUser, IProjectFile, IFileMetadata } from ".";
import { IProjectInfo, IExternalUser } from "./external";
import { normalizePath } from "../util";
import { array } from "../util/array";
import { createPreview } from "../application/preview";

export function createProjectInfo(project: IProject, files: IFileMetadata[]): IProjectInfo {
    return {
        name: project.name,
        id: `${project._id}`,
        uri: project.uri,
        files: files.map(x => ({
            file: x.file,
            fileId: x.fileId,
            type: x.type,
            buildStatus: "fail",
            preview: createPreview(x),
        }))
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
    const createProjectInfo2 = (x: IProject) => createProjectInfo(x, []);

    return {
        id: `${user._id}`,
        email: user.email,
        projects: projects.map(createProjectInfo2)
    };
}