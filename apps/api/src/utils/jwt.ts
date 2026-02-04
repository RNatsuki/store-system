import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

/**
 * Generates a signed JWT token containing user information.
 *
 * The token payload includes the user's ID, role, and email. The token is signed
 * using the JWT_SECRET environment variable and expires based on JWT_EXPIRES_IN
 * (defaults to 1 day if not set).
 *
 * @param id - The unique identifier of the user
 * @param role - The role of the user (e.g., 'admin', 'user', 'manager')
 * @param email - The email address of the user
 * @returns A signed JWT token string
 *
 * @example
 * ```typescript
 * const token = signToken('123', 'admin', 'user@example.com');
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 *
 * @remarks
 * - The token payload is not encrypted, only signed
 * - Do not include sensitive information in the payload
 * - Requires JWT_SECRET environment variable to be set
 */
export const signToken =(id:string, role:string, email:string):string =>{
    return jwt.sign({id,role,email},process.env.JWT_SECRET as string , {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as string,
    } as jwt.SignOptions);
};