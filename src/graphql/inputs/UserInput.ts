import { Field, InputType } from "type-graphql";
import { UserRole } from "../../entities/User";

@InputType()
export class CreateUserInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field(() => UserRole, { defaultValue: UserRole.AUTHOR })
  role!: UserRole;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}
