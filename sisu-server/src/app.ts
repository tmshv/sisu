import express, { Application, Request, Response } from "express";
import { Db } from "mongodb";
import compression from "compression";  // compresses requests
import errorHandler from "errorhandler";
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
import * as projectController from "./controllers/project";
import * as fileController from "./controllers/file";
import { createProjectInfo } from "./core/factory";
import { ENVIRONMENT } from "./util/secrets";

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

  if (ENVIRONMENT !== "production") {
    // Error Handler. Provides full stack - remove for production

    app.use(errorHandler());
  }

  // app.use((req, res, next) => {
  //   res.locals.user = req.user;
  //   next();
  // });

  // app.use(
  //   express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
  // );

  app.post("/upload", isAuthenticated, fileController.createFile("file"), fileController.postUpload());

  app.get("/projects", isAuthenticated, async (req: Request, res: Response) => {
    const projects = await db.collection("projects").find({}).toArray();
    const resource = projects.map(createProjectInfo);

    res.json(success({
      resource,
    }));
  });

  app.get("/projects/:id", isAuthenticated, projectController.getProject(db));
  app.get("/projects/:id/info", isAuthenticated, projectController.getProjectInfo(db));

  app.get("/projects/:projectId/file/:fileId", isAuthenticated, projectController.getProjectFile(db));
  app.put("/projects/:projectId/file/:fileId", isAuthenticated, projectController.setProjectFile(db));
  app.put("/projects/:projectId/file/:fileId/tests", isAuthenticated, projectController.setProjectFileTests(db));

  app.get("/projects/:id/config", isAuthenticated, projectController.getProjectConfig(db));
  app.get("/projects/:id/config/input", isAuthenticated, projectController.getProjectConfigInput(db));
  // app.put("/projects/:id/config", isAuthenticated, projectController.setProjectConfig(db));

  app.get("/projects/:id/config-data", isAuthenticated, projectController.getProjectConfigData(db));
  app.put("/projects/:id/config-data", isAuthenticated, projectController.setProjectConfigData(db));

  app.get("/projects/:id/state", isAuthenticated, projectController.getProjectState(db));
  app.post("/projects/:id/update-state", isAuthenticated, projectController.updateProjectState(db));

  app.get("/user", isAuthenticated, userController.getUser(db));

  app.post("/login", authController.postLogin(db));
  // app.post("/forgot", userController.postForgot);
  // app.post("/reset/:token", userController.postReset);

  app.all("*", (req: Request, res: Response) => {
    return res.status(404).json(errorMessage("Not found"));
  });

  return app;
}