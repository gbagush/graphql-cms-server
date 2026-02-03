import { Arg, Authorized, ID, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../entities/Category";
import { CategoryService } from "../../services/CategoryService";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../inputs/CategoryInput";
import { UserRole } from "../../entities/User";

@Resolver(() => Category)
export class CategoryResolver {
  private categoryService = new CategoryService();

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.getAll();
  }

  @Query(() => Category, { nullable: true })
  async category(@Arg("id", () => ID) id: number): Promise<Category | null> {
    return this.categoryService.getById(id);
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
