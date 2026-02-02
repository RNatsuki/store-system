import express from "express";
import chalk from "chalk";
// import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes";
import { prisma } from "@store-system/db";

dotenv.config();

const app: express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to database
async function connectDB() {
  await prisma.$connect();
  console.log(chalk.bgBlue.white("DATABASE CONNECTED"));
}

connectDB().catch((error) => {
  console.log(chalk.red(error));
});

// routes

app.use("/api/auth", userRouter);

// start server
const port = process.env.PORT || 4321;
app.listen(port, () => {
  console.log(chalk.bgGreen.black(`listening port: http://localhost:${port} `));
});

export default app;
