import express, { Router } from "express";
import { loginForm, getCsrfToken } from "../controllers/userController";

const userRouter: Router = express.Router();

userRouter.get("/csrf-token", getCsrfToken);

userRouter.post("/login", loginForm);

// userRouter.get("/verify:token", verifyToken);

export default userRouter;
