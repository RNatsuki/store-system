import bcrypt from "bcrypt";

import { prisma } from "@store-system/db";
import { Result, AppError } from "../shared/core/Result";

interface LoginResult {
  msg: string;
  user: {
    email: string;
    role: string;
    id: string;
  };
}

export async function loginUserService(
  email: string,
  password: string,
): Promise<Result<LoginResult, AppError>> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Result.fail(new AppError("User not found", 404));
    }

    if (!user.isVerified) {
      return Result.fail(new AppError("Account pending verification", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Result.fail(new AppError("Invalid credentials", 401));
    }

    return Result.ok({
      msg: "Access granted",
      user: {
        email: user.email,
        role: user.role,
        id: user.id,
      },
    });
  } catch (error) {
    console.error("[loginUserService Error]:", error);
    return Result.fail(new AppError("Internal Server Error", 500));
  }
}
