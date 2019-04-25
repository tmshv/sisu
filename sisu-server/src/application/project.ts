import parseIngore from "parse-gitignore";
import { IProject, IProjectSettings } from "../core";

type Ignore = {
    include: boolean,
    patterns: string[],
};

export function getProjectSettings(project: IProject): IProjectSettings {
    if (project.settings) {
        return project.settings;
    }

    return {
        config: null,
        ignoreInclude: false,
        ignoreData: "",
    };
}

export function getProjectIgnore(project: IProject): Ignore {
    const settings = getProjectSettings(project);
    const patterns = parseIngore(settings.ignoreData);

    return {
        patterns,
        include: settings.ignoreInclude,
    };
}
