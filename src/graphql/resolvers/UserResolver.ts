import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { GraphQLError } from "graphql/error";
import { User, UserRole } from "../../entities/User";
import { UserService } from "../../services/UserService";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
} from "../inputs/UserInput";
import type { Context } from "../types/Context";

@Resolver()
export class UserResolver {
  private userService = new UserService();

  @Authorized([UserRole.SUPER_ADMIN])
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.getAll();
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Query(() => User)
  async user(@Arg("id", () => Int) id: number): Promise<User> {
    return this.userService.getById(id);
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => User)
  async createUser(@Arg("input") input: CreateUserInput): Promise<User> {
    return this.userService.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
    });
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => User)
  async updateUser(
    @Arg("id", () => Int) id: number,
    @Arg("input") input: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(id, {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      avatarUrl: input.avatarUrl,
    });
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id", () => Int) id: number,
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    if (user?.id === id) {
      throw new GraphQLError("You cannot delete yourself", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    return this.userService.delete(id);
  }

  @Authorized()
  @Mutation(() => User)
  async updateProfile(
    @Arg("input") input: UpdateProfileInput,
    @Ctx() { user }: Context,
  ): Promise<User> {
    if (!user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    return this.userService.update(user.id, {
      name: input.name,
      email: input.email,
      password: input.password,
      avatarUrl: input.avatarUrl,
    });
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async bulkDeleteUsers(
    @Arg("ids", () => [Int]) ids: number[],
    @Ctx() { user }: Context,
  ): Promise<boolean> {
    const filteredIds = ids.filter((id) => id !== user?.id);

    for (const id of filteredIds) {
      await this.userService.delete(id);
    }

    return true;
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async bulkUpdateUserRole(
    @Arg("ids", () => [Int]) ids: number[],
    @Arg("role", () => UserRole) role: UserRole,
  ): Promise<boolean> {
    for (const id of ids) {
      await this.userService.update(id, { role });
    }

    return true;
  }
}
