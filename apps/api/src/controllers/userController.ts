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
    return res.status(400).json({ errors: errors.array() });
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return res.status(404).json({ errors: [{ msg: "User not found" }] });
  }
  if (!user.isVerified) {
    return res.status(401).json({ errors: [{ msg: "User not verified" }] });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ errors: [{ msg: "Invalid password" }] });
  }
  console.log(user);
  return res.status(200).json({ msg: "User logged in successfully" });
};

export { loginForm };
