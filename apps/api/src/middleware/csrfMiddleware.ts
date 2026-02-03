import crypto from "crypto";
import express from "express";
/**
 * Genera un token CSRF aleatorio y seguro.
 *
 * @returns {string} Token CSRF de 48 caracteres hexadecimales.
 *
 * @example
 * ```ts
 * const token = generateCsrfToken();
 * console.log(token); // "..."
 * ```
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(24).toString("hex");
};

/**
 * Middleware que genera o recupera el token CSRF y lo hace disponible en la solicitud.
 *
 * Si no existe un token en las cookies, genera uno nuevo y lo almacena.
 * El token se expone en `req.csrfToken` y `res.locals.csrfToken` para usarlo en las vistas.
 *
 * @param {express.Request} req - Objeto de solicitud de Express.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @example
 * Usar globalmente en la app:
 * ```ts
 * app.use(csrfMiddleware);
 * ```
 */
const csrfMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!req.cookies.csrfToken) {
    const csrfToken = generateCsrfToken();
    res.cookie("csrfToken", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });
    req.csrfToken = csrfToken;
  } else {
    req.csrfToken = req.cookies.csrfToken;
  }
  res.locals.csrfToken = req.csrfToken;
  next();
};

interface HttpError extends Error {
  status?: number;
}

/**
 * Middleware que verifica la validez del token CSRF en solicitudes que modifican datos.
 *
 * Solo valida métodos: `POST`, `PUT`, `DELETE`, `PATCH`.
 * Compara el token de la cookie con el token enviado en el cuerpo (`_csrf`) o en el header (`x-csrf-token`).
 *
 * @param {express.Request} req - Objeto de solicitud de Express.
 * @param {express.Response} _res - Objeto de respuesta de Express (no utilizado).
 * @param {express.NextFunction} next - Función para pasar al siguiente middleware.
 * @throws {HttpError} Error 403 si el token CSRF no es válido o no coincide.
 *
 * @example
 * Proteger una ruta específica:
 * ```ts
 * app.post("/api/data", verifyCsrfToken, (req, res) => {
 *   res.send("Datos seguros");
 * });
 * ```
 */
const verifyCsrfToken = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    return next();
  }
  const expectedToken = req.csrfToken;
  const csrfTokenFromBody = req.body._csrf || req.headers["x-csrf-token"];

  if (
    !expectedToken ||
    !csrfTokenFromBody ||
    expectedToken !== csrfTokenFromBody
  ) {
    const error = new Error("Invalid or missing CSRF token") as HttpError;
    error.status = 403;
    return next(error);
  }
  next();
};

/**
 * Middleware que regenera el token CSRF después de operaciones que modifican datos.
 *
 * Solo se ejecuta en métodos: `POST`, `PUT`, `DELETE`, `PATCH`.
 * Útil para prevenir ataques de reutilización de tokens (rotación de tokens) tras acciones sensibles como login.
 *
 * @param {express.Request} req - Objeto de solicitud de Express.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @example
 * Regenerar token tras login:
 * ```ts
 * app.post("/login", verifyCsrfToken, loginController, regenerateCsrfToken);
 * ```
 */
const regenerateCsrfToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    return next();
  }
  const newCsrfToken = generateCsrfToken();
  res.cookie("csrfToken", newCsrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 360000, // 1 hour
  });
  req.csrfToken = newCsrfToken;
  res.locals.csrfToken = newCsrfToken;
  next();
};

export { csrfMiddleware, verifyCsrfToken, regenerateCsrfToken };
