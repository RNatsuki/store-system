import { prisma } from "@store-system/db";
import { Response, Request } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";

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
    //  auth logic
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: "User not found", csrfToken: res.locals.csrfToken }],
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        errors: [
          {
            msg: "Account pending verification",
            csrfToken: res.locals.csrfToken,
          },
        ],
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        errors: [
          { msg: "Invalid credentials", csrfToken: res.locals.csrfToken },
        ],
      });
    }
    const token = signToken(
      user?.id as string,
      user?.role as string,
      user?.email as string,
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      msg: "Access granted",
      user: { email: user.email, role: user.role, id: user.id },
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
