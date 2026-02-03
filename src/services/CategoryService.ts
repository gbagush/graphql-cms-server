import { GraphQLError } from "graphql/error";
import { AppDataSource } from "../lib/datasource";
import { Category } from "../entities/Category";

interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
}

export class CategoryService {
  private categoryRepository = AppDataSource.getRepository(Category);

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ["parent", "children"],
      order: { created_at: "ASC" },
    });
  }

  async getById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });
  }

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const category = this.categoryRepository.create({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
    });

    if (payload.parentId) {
      const parent = await this.categoryRepository.findOneBy({
        id: payload.parentId,
      });

      if (!parent) {
        throw new GraphQLError("Parent category not found", {
          extensions: { code: "BAD_REQUEST" },
        });
      }

      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  async update(id: number, payload: UpdateCategoryPayload): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent"],
    });

    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    if (payload.parentId !== undefined) {
      if (payload.parentId === null) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepository.findOneBy({
          id: payload.parentId,
        });

        if (!parent) {
          throw new GraphQLError("Parent category not found", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        category.parent = parent;
      }
    }

    Object.assign(category, {
      name: payload.name ?? category.name,
      slug: payload.slug ?? category.slug,
      description: payload.description ?? category.description,
    });

    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected === 1;
  }
}
