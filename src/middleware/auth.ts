import * as jwt from "jsonwebtoken";
import * as config from "config";
import { ISessionUser } from "../interfaces/custom";
import { Request, Response } from "express";

export function auth(req: Request, res: Response, next: Function) {
    //get the token from the header if present
    //const token: string = req.headers["x-access-token"] || req.headers["authorization"];
    const token: string = req.rawHeaders["x-access-token"] || req.rawHeaders["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token && res) {
        return res.status(401).send("Access denied. No token provided.");
    }

    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded: ISessionUser = <ISessionUser>jwt.verify(token, config.get("token_salt"));
        if (decoded.expiration < new Date().getTime() && decoded.expiration != -1) {
            throw new Error("Invalid token");
        }
        req.user = decoded;
        next();
    } catch (ex) {
        //if invalid token
        if (res) {
            res.status(400).send("Invalid token.");
        }
        next(ex);
    }
};