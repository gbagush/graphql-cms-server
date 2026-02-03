import { Field, InputType, ID } from "type-graphql";

@InputType()
export class CreateCategoryInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  slug!: string;

  @Field(() => ID, { nullable: true })
  parentId?: number;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field(() => ID, { nullable: true })
  parentId?: number | null;
}
