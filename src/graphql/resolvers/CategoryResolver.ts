import {
  Arg,
  Authorized,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Category } from "../../entities/Category";
import { CategoryService } from "../../services/postgres/CategoryService";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../inputs/CategoryInput";
import { UserRole } from "../../entities/User";

@Resolver(() => Category)
export class CategoryResolver {
  private categoryService = new CategoryService();

  @FieldResolver(() => Number)
  async postCount(@Root() category: Category): Promise<number> {
    return this.categoryService.getPostCountByCategoryId(category.id);
  }

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.getAll();
  }

  @Query(() => Category, { nullable: true })
  async category(@Arg("id", () => ID) id: number): Promise<Category | null> {
    return this.categoryService.getById(id);
  }

  @Query(() => Category, { nullable: true })
  async categoryBySlug(@Arg("slug") slug: string): Promise<Category | null> {
    return this.categoryService.getBySlug(slug);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Category)
  async createCategory(
    @Arg("input") input: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(input);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Category)
  async updateCategory(
    @Arg("id", () => ID) id: number,
    @Arg("input") input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(id, input);
  }

  @Authorized([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @Mutation(() => Boolean)
  async deleteCategory(@Arg("id", () => ID) id: number): Promise<boolean> {
    return this.categoryService.delete(id);
  }
}
