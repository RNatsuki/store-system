import {Request, Response, NextFunction} from 'express';

/**
 * *Middleware to restrict access to users with ADMIN role only.
 *
 * This middleware checks if the authenticated user has the ADMIN role.
 * If not, it returns a 403 Forbidden error. If the user is an admin,
 * the request proceeds to the next middleware or controller.
 *
 * @param req - Express request object (must have user property from authenticate middleware)
 * @param res - Express response object
 * @param next - Express next function to pass control to the next middleware
 *
 * @returns A 403 JSON response if user is not an admin, otherwise calls next()
 *
 * @example
 * ```typescript
 * // In routes file
 * router.post('/admin/users',
 *   authenticate,      // First verify user is authenticated
 *   isAdmin,          // Then check if user is admin
 *   createUserController
 * );
 * ```
 *
 * @remarks
 *! **Prerequisites:**
 * - Must be used AFTER the `authenticate` middleware
 * - Requires `req.user` to be populated with user data including `role` property
 *
 *! **Security:**
 * - Returns clear error message for better UX
 * - Prevents non-admin users from accessing protected resources
 * - Should be combined with backend role checks in controllers for defense in depth
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    console.log('[isAdmin] Verificando rol de usuario:', req.user?.role);
    if (req.user?.role !== 'ADMIN') {
        console.log('[isAdmin] Acceso denegado - Usuario no es ADMIN');
        return res.status(403).json({
            errors: [{msg: 'Acceso denegado: se requieren privilegios de administrador'}]
        });
    }
    console.log('[isAdmin] Usuario es ADMIN, permitiendo acceso');

    next();
};