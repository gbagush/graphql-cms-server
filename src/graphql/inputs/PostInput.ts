import { Field, ID, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field()
  content!: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: number | null;

  @Field(() => [ID], { nullable: true })
  tagIds?: number[];
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: number | null;

  @Field(() => [ID], { nullable: true })
  tagIds?: number[];
}
