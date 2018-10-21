import { IProject } from ".";

export function createProjectInfo(project: IProject): object {
    return {
        name: project.name,
        id: project._id,
        uri: project.uri,
        files: project.lastState.projectFilenames,
    };
}