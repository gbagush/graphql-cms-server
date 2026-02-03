import { Arg, Authorized, ID, Mutation, Query, Resolver } from "type-graphql";
import { Tag } from "../../entities/Tag";
import { TagService } from "../../services/TagService";
import { UserRole } from "../../entities/User";
import { CreateTagInput, UpdateTagInput } from "../inputs/TagInput";

@Resolver(() => Tag)
export class TagResolver {
  private tagService = new TagService();

  @Query(() => [Tag])
  async tags(): Promise<Tag[]> {
    return this.tagService.getAll();
  }

  @Query(() => Tag, { nullable: true })
  async tag(@Arg("id", () => ID) id: number): Promise<Tag | null> {
    return this.tagService.getById(id);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Tag)
  async createTag(@Arg("input") input: CreateTagInput): Promise<Tag> {
    return this.tagService.create(input);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Tag)
  async updateTag(
    @Arg("id", () => ID) id: number,
    @Arg("input") input: UpdateTagInput,
  ): Promise<Tag> {
    return this.tagService.update(id, input);
  }

  @Authorized([UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async deleteTag(@Arg("id", () => ID) id: number): Promise<boolean> {
    return this.tagService.delete(id);
  }
}
