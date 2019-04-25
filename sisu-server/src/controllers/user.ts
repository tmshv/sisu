import { Request, Response, NextFunction } from "express";
import { Db } from "mongodb";
import { resource } from "../lib/api";
import { IExternalUser } from "../core/external";
import { IUser, IProject } from "../core";
import { findProjectsById } from "../data/project";
import { createProjectInfo } from "../core/factory";

export function getUser(db: Db) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.user as IUser;

    const projects = await findProjectsById(db, user.projects);

    const createProjectInfo2 = (x: IProject) => createProjectInfo(x, []);
    const userInfo: IExternalUser = {
      id: `${user._id}`,
      email: user.email,
      projects: projects.map(createProjectInfo2)
    };

    return res.json(resource(userInfo));
  };
}
