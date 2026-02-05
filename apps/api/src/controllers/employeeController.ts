import { Request, Response } from "express";
import { prisma } from "@store-system/db";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mailer";

/**
 * Creates a new employee and their user account.
 *
 * Performs an atomic transaction to create both User and Employee records,
 * then sends a verification email with temporary credentials.
 *
 * @param {Request} req - Express request object containing employee data in body
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with success message and CSRF token
 *
 * @remarks
 * - Only accessible by ADMIN users (enforced by middleware)
 * - Generates temporary password and verification token
 * - Uses 'lastname' to match request body and schema
 * - Token expires in 1 hour
 */
export const createEmployee = async (req: Request, res: Response) => {
  const { name, lastname, email, address, role, nss, rfc, birthdate } = req.body;

  try {
    // 1. Validate if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        errors: [{ msg: "El correo ya está en uso", csrfToken: res.locals.csrfToken }]
      });
    }

    const birthdateDate = birthdate ? new Date(birthdate) : new Date();
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 2. Prisma atomic transaction (User + Employee)
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: tempPassword, // Prisma extension will hash it automatically
          role,
          isVerified: false,
          token: verificationToken,
          tokenExpires: new Date(Date.now() + 3600000), // 1 hour validity
        },
      });

      const employee = await tx.employee.create({
        data: {
          name,
          lastname,
          address,
          nss,
          rfc,
          birthdate: birthdateDate,
          userId: newUser.id,
        }
      });

      return { newUser, employee };
    });

    // 3. Send verification email
    // Pass the token and generated temporary password
    await sendVerificationEmail(email, verificationToken, tempPassword);

    return res.status(201).json({
        msg: "Empleado creado exitosamente. Se ha enviado un correo de verificación.",
        csrfToken: res.locals.csrfToken
    });

  } catch (error) {
    console.error("[createEmployee Error]:", error);
    return res.status(500).json({
        message: "Error interno del servidor",
        csrfToken: res.locals.csrfToken
    });
  }
};

/**
 * Verifies employee account and cleans the token from the database.
 *
 * Validates the token from query parameters, checks expiration,
 * and marks the user as verified while removing the token.
 *
 * @param {Request} req - Express request object with token in query params
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with verification status
 *
 * @remarks
 * - Token is removed from database after successful verification
 * - Tokens expire after 1 hour
 * - Uses query parameter (not route param) to match mailer URL
 */
export const verifyEmployeeAccount = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    const user = await prisma.user.findFirst({
      where: {
        token: String(token),
        tokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "El token es inválido o ha expirado. Contacta al administrador."
      });
    }

    // Activation and token cleanup (returns to NULL)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,      // Mark as verified
        token: null,           // Token cleanup after use
        tokenExpires: null,    // Expiration cleanup
      }
    });

    return res.status(200).json({
      msg: "Cuenta verificada con éxito. Ahora puedes establecer tu contraseña definitiva."
    });

  } catch (error) {
    console.error("[verifyEmployeeAccount Error]:", error);
    return res.status(500).json({ message: "Error interno al verificar la cuenta" });
  }
};