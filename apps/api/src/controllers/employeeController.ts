import { Request, Response } from "express";
import {
  createEmployeeService,
  verifyEmployeeAccountService,
  CreateEmployeeData,
} from "../services/employeeService";

/**
 * Creates a new employee and their user account.
 *
 * Performs an atomic transaction to create both User and Employee records,
 * then sends a verification email with temporary credentials.
 *
 * @param {Request} req - Express request object containing employee data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @remarks
 * - Only accessible by ADMIN users (enforced by middleware)
 * - Generates temporary password and verification token
 * - Uses 'lastname' to match request body and schema
 * - Token expires in 1 hour
 */
export const createEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const data: CreateEmployeeData = req.body;
  const result = await createEmployeeService(data);

  if (!result.isSuccess) {
    const error = result.getError();
    res.status(error.code).json({
      message: error.message,
      csrfToken: res.locals.csrfToken,
    });
    return;
  }

  res.status(201).json({
    data: result.getValue(),
    csrfToken: res.locals.csrfToken,
  });
};

/**
 * Verifies employee account and cleans the token from the database.
 *
 * Validates the token from query parameters, checks expiration,
 * and marks the user as verified while removing the token.
 *
 * @param {Request} req - Express request object with token in query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @remarks
 * - Token is removed from database after successful verification
 * - Tokens expire after 1 hour
 * - Uses query parameter (not route param) to match mailer URL
 */
export const verifyEmployeeAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.query as { token: string };
  const result = await verifyEmployeeAccountService(token);

  if (!result.isSuccess) {
    const error = result.getError();
    res.status(error.code).json({
      message: error.message,
      csrfToken: res.locals.csrfToken,
    });
    return;
  }

  res.status(200).json({
    data: result.getValue(),
    csrfToken: res.locals.csrfToken,
  });
};
