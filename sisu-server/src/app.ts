import express, { Application, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";
import compression from "compression";  // compresses requests
import cors from "cors";
// import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
// import flash from "express-flash";
import path from "path";
// import mongoose from "mongoose";
// import passport from "passport";
import expressValidator from "express-validator";
// import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import { MONGODB_URI } from "./util/secrets";

// const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";
// import * as userController from "./controllers/user";
// import * as apiController from "./controllers/api";
// import * as contactController from "./controllers/contact";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { filter } from "async";

interface IProject {
  _id: ObjectId;
  version: string;
  name: string;
  uri: object;
  files: IProjectFile[];
  config: object;
  lastState: IProjectState;
}

interface IProjectFile {
  filename: string;
  log: object;
  previewImageUrl: string;
  lastScanTs: number;
}

interface IProjectState {
  projectFilenames: string[];
  lastScanTs: number;
  workerAppVersion: string;
}

function oid(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch (e) {
    return undefined;
  }
}

function success(extend?: object): object {
  return {
    status: "ok",
    ...extend,
  };
}

function error(error: object): object {
  return {
    status: "failed",
    error,
  };
}

function array<T>(maybeArray: Array<T>): Array<T> {
  return Array.isArray(maybeArray)
    ? maybeArray
    : [];
}

export function createServer(db: Db): Application {
  // Create Express server
  const app = express();

  // // Connect to MongoDB
  // const mongoUrl = MONGODB_URI;
  // (<any>mongoose).Promise = bluebird;
  // mongoose.connect(mongoUrl, {useMongoClient: true}).then(
  //   () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  // ).catch(err => {
  //   console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  //   // process.exit();
  // });

  // Express configuration
  // app.set("views", path.join(__dirname, "../views"));
  // app.set("view engine", "pug");
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  app.use(expressValidator());
  // app.use(session({
  //   resave: true,
  //   saveUninitialized: true,
  //   secret: SESSION_SECRET,
  //   store: new MongoStore({
  //     url: mongoUrl,
  //     autoReconnect: true
  //   })
  // }));
  // app.use(passport.initialize());
  // app.use(passport.session());
  // app.use(flash());
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));
  // app.use((req, res, next) => {
  //   res.locals.user = req.user;
  //   next();
  // });
  // app.use((req, res, next) => {
  //   // After successful login, redirect back to the intended page
  //   if (!req.user &&
  //     req.path !== "/login" &&
  //     req.path !== "/signup" &&
  //     !req.path.match(/^\/auth/) &&
  //     !req.path.match(/\./)) {
  //     req.session.returnTo = req.path;
  //   } else if (req.user &&
  //     req.path == "/account") {
  //     req.session.returnTo = req.path;
  //   }
  //   next();
  // });

  // app.use(
  //   express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
  // );

  /**
   * Primary app routes.
   */
  app.get("/", homeController.index);

  app.post("/upload", async (req: Request, res: Response) => {
    res.json({
      previewImageUrl: "",
    });
  });

  app.get("/project/:id", async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const project = await db.collection("projects").findOne({
      _id: oid(projectId),
    });

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

  app.get("/project/:id/info", async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const project = await db.collection("projects").findOne({
      _id: oid(projectId),
    }) as IProject;

    if (!project) {
      res.status(404);
      return res.json(error({
        message: `Project ${projectId} not found`,
      }));
    }

    const resource = {
      name: project.name,
      id: project._id,
      files: project.lastState.projectFilenames,
    };

    res.json(success({
      resource,
    }));
  });

  app.get("/project/:id/file", async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const filename = req.query.file;

    if (!filename) {
      res.status(400);
      return res.json(error({
        message: "Filename required as query 'file'",
      }));
    }

    const project = await db.collection("projects").findOne({
      _id: oid(projectId),
    }) as IProject;

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

  app.put("/project/:id/file", async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const file = req.body as IProjectFile;

    const project = await db.collection("projects").findOne({
      _id: oid(projectId),
    });

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

  app.put("/project/:id/config", async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const config = req.body;

    const project = await projects.findOne({
      _id: oid(projectId),
    });

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

  app.post("/project/:id/update-state", async (req: Request, res: Response) => {
    const projects = db.collection("projects");
    const projectId = req.params.id;
    const state = req.body as IProjectState;

    const project = await projects.findOne({
      _id: oid(projectId),
    });

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

  // app.get("/login", userController.getLogin);
  // app.post("/login", userController.postLogin);
  // app.get("/logout", userController.logout);
  // app.get("/forgot", userController.getForgot);
  // app.post("/forgot", userController.postForgot);
  // app.get("/reset/:token", userController.getReset);
  // app.post("/reset/:token", userController.postReset);
  // app.get("/signup", userController.getSignup);
  // app.post("/signup", userController.postSignup);
  // app.get("/contact", contactController.getContact);
  // app.post("/contact", contactController.postContact);
  // app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
  // app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
  // app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
  // app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
  // app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

  /**
   * API examples routes.
   */
  // app.get("/api", apiController.getApi);
  // app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

  /**
   * OAuth authentication routes. (Sign in)
   */
  // app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
  // app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  //   res.redirect(req.session.returnTo || "/");
  // });

  return app;
}