import type { Request } from "express";
import { verifyToken } from "../lib/jwt";
import type { Context } from "../graphql/types/Context";
import { UserService } from "../services/UserService";

const userService = new UserService();

export const authMiddleware = async ({
  req,
}: {
  req: Request;
}): Promise<Context> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return {};
  }

  try {
    const decoded = verifyToken(token);
    const user = await userService.getById(decoded.userId);
    return { user };
  } catch (error) {
    return {};
  }
};
