import { prisma } from "@store-system/db";
import { Response, Request } from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";

const loginForm = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  await check("email").notEmpty().isEmail().run(req);
  await check("password").notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: [{ ...errors.array(), csrfToken: res.locals.csrfToken }],
    });
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return res.status(404).json({
      errors: [{ msg: "User not found", csrfToken: res.locals.csrfToken }],
    });
  }
  if (!user.isVerified) {
    return res.status(401).json({
      errors: [{ msg: "User not verified", csrfToken: res.locals.csrfToken }],
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      errors: [{ msg: "Invalid password XD", csrfToken: res.locals.csrfToken }],
    });
  }
  return res.status(200).json({
    msg: "User logged in successfully",
    csrfToken: res.locals.csrfToken,
  });
};

const getCsrfToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken });
};

export { loginForm, getCsrfToken };
