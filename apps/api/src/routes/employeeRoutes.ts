
import express, { Router } from "express";
import { createEmployee, verifyEmployeeAccount } from "../controllers/employeeController";
import { verifyCsrfToken } from "../middleware/csrfMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/roleMiddleware";
import { handleValidator } from "../middleware/handleValidator";
import { createEmployeeValidator } from "../validators";

export const employeeRoutes: Router = express.Router();

// Create employee - Protected route (ADMIN only)
employeeRoutes.post("/",
  verifyCsrfToken,
  authenticate,
  isAdmin,
  createEmployeeValidator,
  handleValidator,
  createEmployee
);

employeeRoutes.get("/verify/:token", verifyEmployeeAccount)