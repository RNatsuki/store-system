import {Request, Response, NextFunction} from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator.
 *
 * This middleware processes the validation results accumulated by express-validator
 * rules defined at the route level. If validation errors are present, it returns
 * a standardized 400 error response with the error messages and CSRF token.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to pass control to the next middleware
 *
 * @returns A 400 JSON response if validation errors exist, otherwise calls next()
 *
 * @example
 * ```typescript
 * // In routes file
 * router.post('/register',
 *   body('email').isEmail().withMessage('Invalid email'),
 *   body('password').isLength({ min: 8 }).withMessage('Password too short'),
 *   handleValidator, // This middleware processes the validation results
 *   registerController
 * );
 * ```
 *
 * @remarks
 * - This middleware should be placed after express-validator rules and before controllers
 * - Automatically includes the CSRF token in error responses from res.locals.csrfToken
 * - Returns all validation errors in a single response
 * - Follows the "fail fast" pattern: stops request processing on first validation failure
 *
 */
export const handleValidator = (req:Request, res:Response, next:NextFunction) => {
    console.log('[handleValidator] Validando request');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('[handleValidator] Errores de validación encontrados:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
            errors: errors.array().map((err)=>({
                msg: err.msg,
                csrfToken: res.locals.csrfToken
            })),
        });


    }
    console.log('[handleValidator] Validación exitosa, continuando...');
    next();
}
