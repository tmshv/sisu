import express, { Application, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";
import compression from "compression";  // compresses requests
import cors from "cors";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import passport from "passport";
import expressValidator from "express-validator";
import { initPassport, isAuthenticated } from "./config/passport";
import { success, error, errorMessage } from "./lib/api";

// Controllers (route handlers)
import * as authController from "./controllers/auth";
import * as userController from "./controllers/user";
import { IProject, IProjectFile, IProjectState } from "./core";
import { createProjectInfo } from "./core/factory";

function array<T>(maybeArray?: Array<T>): Array<T> {
  return Array.isArray(maybeArray)
    ? maybeArray!
    : [];
}

export function createServer(db: Db): Application {
  initPassport(db);

  // Create Express server
  const app = express();

  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  app.use(expressValidator());
  app.use(passport.initialize());
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));

  // app.use((req, res, next) => {
  //   res.locals.user = req.user;
  //   next();
  // });

  // app.use(
  //   express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
  // );

  app.post("/upload", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      previewImageUrl: "",
    });
  });

  app.get("/projects", isAuthenticated, async (req: Request, res: Response) => {
    const projects = await db.collection("projects").find({}).toArray();
    const resource = projects.map(createProjectInfo);

    res.json(success({
      resource,
    }));
  });

  app.get("/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    );

    if (!project) {
      res.status(404);
      return res.json(error({
        message: `Project ${projectId} not found`,
      }));
    }

    res.json(success({
      resource: project,
    }));
  });

  app.get("/projects/:id/info", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    ) as IProject;

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
  });

  app.get("/projects/:id/file", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const filename = req.query.file;

    if (!filename) {
      res.status(400);
      return res.json(error({
        message: "Filename required as query 'file'",
      }));
    }

    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    ) as IProject;

    if (!project) {
      res.status(404);
      return res.json(error({
        message: `Project ${projectId} not found`,
      }));
    }

    const resource = project.files.find(x => x.filename === filename);

    if (!resource) {
      res.status(404);
      return res.json(error({
        message: `Project ${projectId} does'nt contains file ${filename}`,
      }));
    }

    res.json(success({
      resource,
    }));
  });

  app.put("/projects/:id/file", isAuthenticated, async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const file = req.body as IProjectFile;

    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    );

    if (!project) {
      res.status(404);
      return res.json(error({
        message: `Project ${projectId} not found`,
      }));
    }

    let files = array(project.files) as IProjectFile[];
    files = files.filter(x => x.filename !== file.filename);
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
  });

  app.put("/projects/:id/config", isAuthenticated, async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const config = req.body;

    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    );

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
  });

  app.post("/projects/:id/update-state", isAuthenticated, async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const state = req.body as IProjectState;

    const project = await db.collection("projects").findOne(
      resourceQuery(projectId)
    );

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
  });

  app.get("/user", isAuthenticated, userController.getUser(db));

  app.post("/login", authController.postLogin(db));
  // app.post("/forgot", userController.postForgot);
  // app.post("/reset/:token", userController.postReset);

  app.all("*", (req: Request, res: Response) => {
      return res.status(404).json(errorMessage("Not found"));
  });

  return app;
}