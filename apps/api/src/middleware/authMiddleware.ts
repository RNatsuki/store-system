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
        console.log('[authenticate] No se encontró token');
        return res.status(401).json({
            errors:[{msg:"No token, authorization denied"}]
        });
    }

    try {
        console.log('[authenticate] Token encontrado, verificando...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as tokenPayload;
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };
        console.log('[authenticate] Usuario autenticado:', req.user);
        console.log('[authenticate] *** LLAMANDO A NEXT() ***');
        next();
        console.log('[authenticate] *** DESPUÉS DE NEXT() ***');
    } catch (error) {
        console.log('[authenticate] Error al verificar token:', error);
        return res.status(401).json({
            errors:[{msg:"Token is not valid"}]
        });
    }
}