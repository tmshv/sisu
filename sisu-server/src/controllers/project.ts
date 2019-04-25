import { Request, Response } from "express";
import { Db } from "mongodb";
import axios from "axios";
import { success, error, resource, errorNotFound } from "../lib/api";
import { IProjectFile, IProjectState, IFileTest, IFileMetadata } from "../core";
import { createProjectInfo } from "../core/factory";
import { findProject } from "../data/project";
import { createFileId } from "../core/lib/file";
import { array } from "../util/array";
import { IDataProviderFile } from "../application/types";
import { createPreview } from "../application/preview";
import { createFileMetadataUrl, createProviderMetadataUrl } from "../application/provider";

export function getProject(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        res.json(success({
            resource: project,
        }));
    };
}

export function getProjectInfo(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const dataProviderId = `${project.dataProviders[0]}`;
        const dpRes = await axios.get(createProviderMetadataUrl(dataProviderId));
        const dpFiles: IDataProviderFile[] = dpRes.data;
        const metaFiles: IFileMetadata[] = dpFiles.map(x => ({
            fileId: x.fileId,
            file: x.filename,
            hash: x.revision,
            type: x.type,
        }));
        const resource = createProjectInfo(project, metaFiles);

        res.json(success({
            resource,
        }));
    };
}

export function getProjectFile(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.projectId;
        const fileId = req.params.fileId;
        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(errorNotFound(projectId));
        }

        const response = await axios.get(createFileMetadataUrl(fileId));
        const file: IDataProviderFile = response.data;

        res.json(resource({
            ...file,
            preview: createPreview(file),
        }));
    };
}

export function setProjectFile(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;
        const fileId = req.params.fileId;
        const file = req.body as IProjectFile;
        file.fileId = fileId;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        let files = array(project.files) as IProjectFile[];
        files = files.filter(x => x.fileId !== fileId);
        files = [...files, file];

        try {
            await projects.updateOne({ _id: project._id }, {
                $set: {
                    files,
                }
            });

            res.json(success());
        } catch (e) {
            res.json(error(e));
        }
    };
}

export function setProjectFileTests(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.projectId;
        const fileId = req.params.fileId;
        const tests = req.body as IFileTest[];

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const files = array(project.files)
            .map(file => {
                if (file.fileId !== fileId) {
                    return file;
                }

                file.tests = tests;
                return file;
            });

        try {
            await projects.updateOne({ _id: project._id }, {
                $set: {
                    files,
                }
            });

            res.json(success());
        } catch (e) {
            res.json(error(e));
        }
    };
}

export function getProjectConfigData(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const configData = project.configData || "";

        res.json(resource(configData));
    };
}

export function setProjectConfigData(db: Db) {
    const projects = db.collection("projects");

    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const project = await findProject(db, projectId);
        const configData = `${req.body.data}`;
        let config: any = undefined;

        try {
            config = JSON.parse(configData);
        } catch (e) {
            return res.status(400).json(error({
                message: `Config is not a json string`,
            }));
        }

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        try {
            await projects.updateOne({ _id: project._id }, {
                $set: {
                    configData,
                    config,
                }
            });

            res.json(resource(configData));
        } catch (e) {
            res.json(error(e));
        }
    };
}

export function setProjectConfig(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;
        const config = req.body;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        try {
            await projects.updateOne({ _id: project._id }, {
                $set: {
                    config,
                }
            });

            res.json(success());
        } catch (e) {
            res.json(error(e));
        }
    };
}

export function getProjectConfig(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        res.json(resource(project.config));
    };
}

export function getProjectConfigInput(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const tasks: any[] = project.config.tasks;
        const inputs = tasks.map((x: any) => x.input);
        const input = inputs.reduce((a, b) => [...a, ...b], []);

        res.json(resource(input));
    };
}

export function updateProjectState(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;
        const state = req.body as IProjectState;

        state.files = state.files.map(x => ({
            ...x,
            fileId: createFileId(x.file),
        }));

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const scopeFiles = array(state.files);

        const files = array(scopeFiles).map(x => ({
            fileId: x.fileId,
            filename: x.file,
            log: "",
            tests: [],
            previewImageUrl: "",
            lastScanTs: 1,
        }));

        try {
            await projects.updateOne({ _id: project._id }, {
                $set: {
                    files,
                    lastState: state,
                }
            });

            res.json(success());
        } catch (e) {
            res.json(error(e));
        }
    };
}

export function getProjectState(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        try {
            res.json(resource(project.lastState));
        } catch (e) {
            res.json(error(e));
        }
    };
}
