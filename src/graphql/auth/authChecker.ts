import type { AuthChecker } from "type-graphql";
import type { Context } from "../types/Context";
import { GraphQLError } from "graphql";

export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  if (!context.user) {
    throw new GraphQLError("Unauthenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  if (roles.length === 0) {
    return true;
  }

  if (roles.includes(context.user.role)) {
    return true;
  }

  throw new GraphQLError("You are not authorized to perform this action", {
    extensions: {
      code: "FORBIDDEN",
      http: { status: 403 },
    },
  });
};
