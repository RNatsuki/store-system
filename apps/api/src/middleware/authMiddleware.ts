import {Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

interface tokenPayload{
    id:string;
    role:string;
    email:string;

}
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            errors:[{msg:"No token, authorization denied"}]
        })
    } try {
        const decoded  = jwt.verify(token, process.env.JWT_SECRET as string) as tokenPayload;
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        }

        next();
    } catch (error) {
        return res.status(401).json({
            errors:[{msg:"Token is not valid"}]
        })
    }
}