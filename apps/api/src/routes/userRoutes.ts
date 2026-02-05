import express, { Router } from "express";
import { loginForm, getCsrfToken } from "../controllers/userController";
import { verifyCsrfToken } from "../middleware/csrfMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import { handleValidator } from "../middleware/handleValidator";
import { loginValidator } from "../validators";

const userRouter: Router = express.Router();


//*User-related routes.

userRouter.get("/csrf-token", getCsrfToken);

//  CSRF Verification ->  Validation -> Handle Validation -> Controller
userRouter.post("/login", verifyCsrfToken, loginValidator, handleValidator, loginForm);

userRouter.get("/me", authenticate, ( req, res) => {
  res.json({ user: req.user });
});



export default userRouter;
