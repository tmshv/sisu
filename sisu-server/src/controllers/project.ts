import { Request, Response } from "express";
import { Db } from "mongodb";
import { success, error, resource } from "../lib/api";
import { IProjectFile, IProjectState } from "../core";
import { createProjectInfo } from "../core/factory";
import { findProject } from "../data/project";
import { normalizePath } from "../util";

function array<T>(maybeArray?: Array<T>): Array<T> {
    return Array.isArray(maybeArray)
        ? maybeArray!
        : [];
}

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

        const resource = createProjectInfo(project);

        res.json(success({
            resource,
        }));
    };
}

export function getProjectFile(db: Db) {
    return async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const filename = req.query.file;

        if (!filename) {
            res.status(400);
            return res.json(error({
                message: "Filename required as query 'file'",
            }));
        }

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const resource = project.files.find(x => filename === normalizePath(x.filename));

        if (!resource) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} does'nt contains file ${filename}`,
            }));
        }

        res.json(success({
            resource,
        }));
    };
}

export function setProjectFile(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;
        const file = req.body as IProjectFile;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        let files = array(project.files) as IProjectFile[];
        files = files.filter(x => file.filename !== normalizePath(x.filename));
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

export function updateProjectState(db: Db) {
    return async (req: Request, res: Response) => {
        const projects = db.collection("projects");
        const projectId = req.params.id;
        const state = req.body as IProjectState;

        const project = await findProject(db, projectId);

        if (!project) {
            res.status(404);
            return res.json(error({
                message: `Project ${projectId} not found`,
            }));
        }

        const scopeFiles = array(state.projectFilenames) as string[];
        let files = array(project.files) as IProjectFile[];

        files = files.filter(x => scopeFiles.includes(x.filename));

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