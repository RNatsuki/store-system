import { Response, Request } from "express";
import { validationResult } from "express-validator";
import { signToken } from "../utils/jwt";

import { loginUserService } from "../services/userService";
export const loginForm = async (req: Request, res: Response) => {
  //  extract errors that the router detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        msg: err.msg,
        csrfToken: res.locals.csrfToken, // keep the token for retry
      })),
    });
  }

  const { email, password } = req.body;

  try {
    const result = await loginUserService(email, password);

    if (!result.isSuccess) {
      const error = result.getError();
      return res.status(error.code).json({
        message: error.message,
        csrfToken: res.locals.csrfToken,
      });
    }

    const { user, msg } = result.getValue();
    const token = signToken(user.id, user.role, user.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: msg,
      user,
      csrfToken: res.locals.csrfToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const getCsrfToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken });
};
