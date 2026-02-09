import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User, UserRole } from "../../entities/User";
import { UserService } from "../../services/postgres/UserService";
import { SetupSuperAdminInput } from "../inputs/SetupInput";
import { GraphQLError } from "graphql/error";

@Resolver()
export class SetupResolver {
  private userService = new UserService();

  @Query(() => Boolean)
  async isSetupCompleted(): Promise<boolean> {
    const count = await this.userService.getCount();
    return count > 0;
  }

  @Mutation(() => User)
  async setupSuperAdmin(
    @Arg("input") input: SetupSuperAdminInput,
  ): Promise<User> {
    const count = await this.userService.getCount();

    if (count > 0) {
      throw new GraphQLError("Setup already completed", {
        extensions: {
          code: "SETUP_ALREADY_COMPLETED",
        },
      });
    }

    return this.userService.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: UserRole.SUPER_ADMIN,
    });
  }
}
