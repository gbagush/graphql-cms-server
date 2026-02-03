import { In } from "typeorm";
import { AppDataSource } from "../lib/datasource";
import { Tag } from "../entities/Tag";

interface CreateTagPayload {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateTagPayload {
  name?: string;
  slug?: string;
  description?: string;
}

export class TagService {
  private tagRepository = AppDataSource.getRepository(Tag);

  async getAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { created_at: "DESC" },
    });
  }

  async getById(id: number): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { id },
    });
  }

  async create(payload: CreateTagPayload): Promise<Tag> {
    const tag = this.tagRepository.create(payload);
    return this.tagRepository.save(tag);
  }

  async getByIds(ids: number[]): Promise<Tag[]> {
    return this.tagRepository.findBy({
      id: In(ids),
    });
  }

  async update(id: number, payload: UpdateTagPayload): Promise<Tag> {
    const tag = await this.tagRepository.findOneBy({
      id,
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    Object.assign(tag, payload);
    return this.tagRepository.save(tag);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.tagRepository.delete(id);
    return result.affected === 1;
  }
}
