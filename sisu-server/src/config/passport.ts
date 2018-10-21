import passport from "passport";
import passportJwt from "passport-jwt";
import { Db } from "mongodb";
import { JWT_SECRET } from "../util/secrets";
import { findUserByEmail } from "../data/user";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export function initPassport(db: Db) {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  };

  passport.use(new JwtStrategy(options, async (jwtPayload: any, cb: any) => {
    const email = jwtPayload.email;

    try {
      const user = await findUserByEmail(db, email);
      cb(undefined, user);
    } catch (error) {
      cb(error, undefined);
    }
  }));
}

export const isAuthenticated = passport.authenticate("jwt", { session: false });
