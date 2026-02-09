import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../../lib/datasource";
import { Post } from "../../entities/Post";
import { User, UserRole } from "../../entities/User";
import { Category } from "../../entities/Category";
import { Tag } from "../../entities/Tag";
import { GraphQLError } from "graphql/error";
import { UserService } from "./UserService";
import { CategoryService } from "./CategoryService";
import { TagService } from "./TagService";

interface CreatePostPayload {
  title: string;
  slug: string;
  content: Record<string, any>;
  excerpt?: string;
  authorId: number;
  categoryId?: number | null;
  tagIds?: number[];
}

interface UpdatePostPayload {
  title?: string;
  slug?: string;
  content?: Record<string, any>;
  excerpt?: string;
  banner_url?: string | null;
  categoryId?: number | null;
  tagIds?: number[];
}

export class PostService {
  private postRepository = AppDataSource.getRepository(Post);

  private userService = new UserService();
  private categoryService = new CategoryService();
  private tagService = new TagService();

  async getAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ["author", "category", "tags"],
      where: { deleted_at: IsNull() },
      order: { created_at: "DESC" },
    });
  }

  async getPublished(filters?: {
    category?: string;
    tag?: string;
    keyword?: string;
  }): Promise<Post[]> {
    const qb = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.category", "category")
      .leftJoinAndSelect("post.tags", "tags")
      .where("post.published_at IS NOT NULL")
      .andWhere("post.deleted_at IS NULL");

    if (filters?.category) {
      qb.andWhere("category.slug = :categorySlug", {
        categorySlug: filters.category,
      });
    }

    if (filters?.tag) {
      qb.innerJoin("post.tags", "filterTag", "filterTag.slug = :tagSlug", {
        tagSlug: filters.tag,
      });
    }

    if (filters?.keyword) {
      qb.andWhere(
        "(post.title ILIKE :keyword OR post.excerpt ILIKE :keyword)",
        { keyword: `%${filters.keyword}%` },
      );
    }

    return qb.orderBy("post.published_at", "DESC").getMany();
  }

  async getDrafts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ["author", "category", "tags"],
      where: {
        published_at: IsNull(),
        deleted_at: IsNull(),
      },
      order: { created_at: "DESC" },
    });
  }

  async getTrashed(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ["author", "category", "tags"],
      withDeleted: true,
      where: {
        deleted_at: Not(IsNull()),
      },
      order: { deleted_at: "DESC" },
    });
  }

  async getById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["author", "category", "tags"],
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  async getBySlug(slug: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { slug },
      relations: ["author", "category", "tags"],
    });
  }

  async create(payload: CreatePostPayload): Promise<Post> {
    const author = await this.userService.getById(payload.authorId);

    let category: Category | null = null;
    if (payload.categoryId !== undefined && payload.categoryId !== null) {
      category = await this.categoryService.getById(payload.categoryId);
      if (!category) throw new Error("Category not found");
    }

    let tags: Tag[] = [];
    if (payload.tagIds?.length) {
      tags = await this.tagService.getByIds(payload.tagIds);
    }

    const post = this.postRepository.create({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      excerpt: payload.excerpt,
      author,
      category,
      tags,
    });

    return this.postRepository.save(post);
  }

  async update(id: number, payload: UpdatePostPayload): Promise<Post> {
    const post = await this.getById(id);

    if (payload.categoryId !== undefined) {
      if (payload.categoryId === null) {
        post.category = null;
      } else {
        const category = await this.categoryService.getById(payload.categoryId);
        if (!category) throw new Error("Category not found");
        post.category = category;
      }
    }

    if (payload.tagIds !== undefined) {
      if (payload.tagIds.length === 0) {
        post.tags = [];
      } else {
        post.tags = await this.tagService.getByIds(payload.tagIds);
      }
    }

    Object.assign(post, {
      title: payload.title ?? post.title,
      slug: payload.slug ?? post.slug,
      content: payload.content ?? post.content,
      excerpt: payload.excerpt ?? post.excerpt,
      banner_url:
        payload.banner_url !== undefined ? payload.banner_url : post.banner_url,
    });

    return this.postRepository.save(post);
  }

  async publish(id: number): Promise<Post> {
    const post = await this.getById(id);
    post.published_at = new Date();
    return this.postRepository.save(post);
  }

  async unpublish(id: number): Promise<Post> {
    const post = await this.getById(id);
    post.published_at = null;
    return this.postRepository.save(post);
  }

  async trash(id: number): Promise<boolean> {
    const result = await this.postRepository.softDelete(id);
    return result.affected === 1;
  }

  async restore(id: number): Promise<boolean> {
    const result = await this.postRepository.restore(id);
    return result.affected === 1;
  }

  async deletePermanently(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    return result.affected === 1;
  }

  async verifyAccess(id: number, user: User): Promise<void> {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return;
    }

    if (user.role === UserRole.AUTHOR) {
      const exists = await this.postRepository.exist({
        where: {
          id,
          author: { id: user.id },
        },
      });

      if (!exists) {
        throw new GraphQLError("Forbidden", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      return;
    }

    throw new GraphQLError("Forbidden", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
