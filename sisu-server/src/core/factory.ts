import { IProject } from ".";
import { IProjectInfo } from "./external";

export function createProjectInfo(project: IProject): IProjectInfo {
    return {
        name: project.name,
        id: `${project._id}`,
        uri: project.uri,
        files: project.lastState.projectFilenames,
    };
}