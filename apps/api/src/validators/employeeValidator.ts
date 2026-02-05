import { body } from "express-validator";

/**
 * Validation rules for creating a new employee.
 *
 * This validator ensures that all required fields for employee creation
 * meet the business requirements and data format constraints.
 *
 * @constant {ValidationChain[]} createEmployeeValidator - Array of express-validator validation chains
 *
 * @example
 * ```typescript
 * // In routes file
 * router.post('/employees',
 *   csrfMiddleware,
 *   verifyCsrfToken,
 *   createEmployeeValidator,
 *   handleValidator,
 *   createEmployeeController
 * );
 * ```
 *
 * @remarks
 * **Validation Rules:**
 * - `name`: Required, non-empty string (trimmed)
 * - `lastname`: Required, non-empty string (trimmed)
 * - `email`: Required, valid email format
 * - `address`: Required, non-empty string (trimmed)
 * - `role`: Must be one of: ADMIN, WAREHOUSE, USER
 * - `nss`: Required, exactly 11 characters (Mexican Social Security Number)
 * - `rfc`: Required, 12-13 characters (Mexican Tax ID)
 * - `birthdate`: Optional, valid ISO 8601 date format
 *
 * All validation errors are returned in Spanish for better UX with local users.
 *
 * @see {@link handleValidator} - Middleware that processes these validation results
 */
export const createEmployeeValidator = [
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("lastname").trim().notEmpty().withMessage("El apellido es obligatorio"),
    body("email").isEmail().withMessage("Proporciona un correo electrónico válido").notEmpty().withMessage("El correo es obligatorio"),
    body("address").trim().notEmpty().withMessage("La dirección es obligatoria"),
    body("role").isIn(["ADMIN","WAREHOUSE", "USER"]).withMessage("El rol no es válido"),
    body("nss").trim().notEmpty().isLength({min:11, max:11}).withMessage("El NSS debe tener exactamente 11 caracteres"),
    body("rfc").trim().notEmpty().isLength({min:12, max:13}).withMessage("El RFC debe tener entre 12 y 13 caracteres"),
    body("birthdate").optional().isISO8601().withMessage("La fecha de nacimiento debe ser una fecha válida"),
]