import jwt, { type Secret } from "jsonwebtoken";

import { env } from "../configs/env";

const JWT_SECRET = env.AUTH.JWT_SECRET as Secret;

export function signToken(payload: { userId: number }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: env.AUTH.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}
