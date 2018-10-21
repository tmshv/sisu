import passport from "passport";
import passportJwt from "passport-jwt";
import _ from "lodash";
import { Request, Response, NextFunction } from "express";
import { Db } from "mongodb";
import { matchPassword } from "../util/secure";
import { IUser } from "../core";
import { JWT_SECRET } from "../util/secrets";
import { findUserByEmail } from "../data/user";
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export function initPassport(db: Db) {
  // passport.serializeUser<any, any>((user, done) => {
  //   done(undefined, user._id);
  // });

  // passport.deserializeUser(async (id, done) => {
  //   try {
  //     const user = await db.collection("users").findOne({
  //       _id: id,
  //     });

  //     done(undefined, user);
  //   } catch (err) {
  //     done(err, undefined);
  //   }
  // });

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
    async (jwtPayload: any, cb: any) => {
      const email = jwtPayload.email;

      try {
        const user = await findUserByEmail(db, email);
        cb(undefined, user);
      } catch (error) {
        cb(error, undefined);
      }
    }
  ));

  // /**
  //  * Sign in using Email and Password.
  //  */
  // passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  //   let user: IUser;

  //   try {
  //     user = await db.collection("users").findOne({
  //       email: email.toLowerCase(),
  //     });

  //   } catch (err) {
  //     return done(err);
  //   }

  //   if (!user) {
  //     return done(undefined, false, { message: `Email ${email} not found.` });
  //   }

  //   if (matchPassword(password, user)) {
  //     return done(undefined, user);
  //   } else {
  //     return done(undefined, false, { message: "Invalid email or password." });
  //   }
  // }));
}

export const isAuthenticated = passport.authenticate("jwt", { session: false });

// /**
//  * Login Required middleware.
//  */
// export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }

//   res.status(401);
//   res.json({
//     error: "Not authorized",
//   });
// };

  // /**
  //  * Authorization Required middleware.
  //  */
  // export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  //   const provider = req.path.split("/").slice(-1)[0];

  //   if (_.find(req.user.tokens, { kind: provider })) {
  //     next();
  //   } else {
  //     res.redirect(`/auth/${provider}`);
  //   }
  // };
