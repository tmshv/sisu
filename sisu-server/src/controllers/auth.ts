import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Db } from "mongodb";
import { JWT_SECRET } from "../util/secrets";
import { findUserByEmail } from "../data/user";
import { matchPassword } from "../util/secure";
import { IUser } from "../core";

export function postLogin(db: Db) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    let user: IUser;

    try {
      user = await findUserByEmail(db, email);
    } catch (error) {
    }

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // This lookup would normally be done using a database
    if (!matchPassword(password, user)) {
      return res.status(401).json({
        error: "Auth Failed",
      });
    }

    const token = jwt.sign({ email }, JWT_SECRET, {
      // expiresIn: 120,  // token expires in 2min
    });

    return res.status(200).json({
      status: "Ok",
      token,
    });
  };
}
