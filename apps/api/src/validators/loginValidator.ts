import {body} from "express-validator";

/**
 * Validation rules for user login authentication.
 *
 * This validator ensures that login credentials meet the required format
 * before attempting authentication. It validates both email and password fields.
 *
 * @constant {ValidationChain[]} loginValidators - Array of express-validator validation chains
 *
 * @example
 * ```typescript
 * // In routes file
 * router.post('/auth/login',
 *   csrfMiddleware,
 *   verifyCsrfToken,
 *   loginValidators,
 *   handleValidator,
 *   loginController
 * );
 * ```
 *
 * @remarks
 * **Validation Rules:**
 * - `email`: Required, must be a valid email format
 * - `password`: Required, non-empty string (no format validation for security reasons)
 *
 * **Security Considerations:**
 * - Password format is not validated here to avoid leaking information about password requirements
 * - Actual password strength validation happens during registration, not login
 * - All validation errors are returned in Spanish for better UX
 *
 * @see {@link handleValidator} - Middleware that processes these validation results
 * @see {@link loginController} - Controller that handles the authentication logic
 */
export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Proporciona un correo electrónico válido")
    .notEmpty()
    .withMessage("El correo es obligatorio"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];