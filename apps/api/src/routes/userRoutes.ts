import express, { Router } from "express";
import { loginForm } from "../controllers/userController";

const userRouter: Router = express.Router();

userRouter.post("/login", loginForm);

// userRouter.get("/verify:token", verifyToken);

export default userRouter;
