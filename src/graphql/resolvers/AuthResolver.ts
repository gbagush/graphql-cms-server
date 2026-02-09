import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LoginInput } from "../inputs/AuthInput";
import { AuthPayload } from "../types/AuthPayload";
import { UserService } from "../../services/postgres/UserService";
import { signToken } from "../../lib/jwt";
import type { Context } from "../types/Context";
import { User, UserRole } from "../../entities/User";

@Resolver()
export class AuthResolver {
  private userService = new UserService();

  @Mutation(() => AuthPayload)
  async login(@Arg("input") input: LoginInput): Promise<AuthPayload> {
    const user = await this.userService.verifyUserCredential(
      input.email,
      input.password,
    );

    const token = signToken({ userId: user.id });

    return {
      accessToken: token,
      user,
    };
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() { user }: Context): Promise<User> {
    return user!;
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Query(() => String)
  async adminOnly(): Promise<string> {
    return "You are an admin!";
  }
}
