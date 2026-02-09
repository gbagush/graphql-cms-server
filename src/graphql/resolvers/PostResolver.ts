import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Post } from "../../entities/Post";
import { PostService } from "../../services/postgres/PostService";
import { CategoryService } from "../../services/postgres/CategoryService";
import { TagService } from "../../services/postgres/TagService";
import { StorageService } from "../../services/storage/StorageService";
import { CreatePostInput, UpdatePostInput } from "../inputs/PostInput";
import { UserRole } from "../../entities/User";
import type { Context } from "../types/Context";

@Resolver(() => Post)
export class PostResolver {
  private postService = new PostService();
  private categoryService = new CategoryService();
  private tagService = new TagService();
  private storageService = new StorageService();

  @Authorized()
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return this.postService.getAll();
  }

  @Query(() => [Post])
  async publishedPosts(
    @Arg("category", { nullable: true }) category?: string,
    @Arg("tag", { nullable: true }) tag?: string,
    @Arg("keyword", { nullable: true }) keyword?: string,
  ): Promise<Post[]> {
    return this.postService.getPublished({ category, tag, keyword });
  }

  @Authorized()
  @Query(() => [Post])
  async draftPosts(): Promise<Post[]> {
    return this.postService.getDrafts();
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Query(() => [Post])
  async trashedPosts(): Promise<Post[]> {
    return this.postService.getTrashed();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => ID) id: number): Promise<Post | null> {
    return this.postService.getById(id);
  }

  @Query(() => Post, { nullable: true })
  async postBySlug(@Arg("slug") slug: string): Promise<Post | null> {
    return this.postService.getBySlug(slug);
  }

  @Authorized([UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Post)
  async createPost(
    @Arg("input") input: CreatePostInput,
    @Ctx() ctx: Context,
  ): Promise<Post> {
    return this.postService.create({
      ...input,
      content: JSON.parse(input.content),
      authorId: ctx.user!.id,
    });
  }

  @Authorized([UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Post)
  async updatePost(
    @Arg("id", () => ID) id: number,
    @Arg("input") input: UpdatePostInput,
    @Ctx() ctx: Context,
  ): Promise<Post> {
    await this.postService.verifyAccess(id, ctx.user!);
    return this.postService.update(id, {
      ...input,
      content: input.content ? JSON.parse(input.content) : undefined,
    });
  }

  @Authorized([UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Post)
  async uploadPostBanner(
    @Arg("id", () => ID) id: number,
    @Arg("imageBase64") imageBase64: string,
    @Ctx() ctx: Context,
  ): Promise<Post> {
    await this.postService.verifyAccess(id, ctx.user!);

    const baseFolder = process.env.CLOUDINARY_FOLDER || "blog";
    const publicId = `${baseFolder}/banners/${id}`;

    const result = await this.storageService.upload(imageBase64, publicId, {
      overwrite: true,
    });

    return this.postService.update(id, { banner_url: result.url });
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Post)
  async publishPost(@Arg("id", () => ID) id: number): Promise<Post> {
    return this.postService.publish(id);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Post)
  async unpublishPost(@Arg("id", () => ID) id: number): Promise<Post> {
    return this.postService.unpublish(id);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async trashPost(@Arg("id", () => ID) id: number): Promise<boolean> {
    return this.postService.trash(id);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async restorePost(@Arg("id", () => ID) id: number): Promise<boolean> {
    return this.postService.restore(id);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => ID) id: number): Promise<boolean> {
    return this.postService.deletePermanently(id);
  }
}
