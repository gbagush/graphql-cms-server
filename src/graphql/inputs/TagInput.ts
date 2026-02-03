import { Field, InputType } from "type-graphql";

@InputType()
export class CreateTagInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  slug!: string;
}

@InputType()
export class UpdateTagInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  slug?: string;
}
