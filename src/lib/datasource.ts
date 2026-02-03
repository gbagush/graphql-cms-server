import { DataSource } from "typeorm";
import { env } from "../configs/env";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Tag } from "../entities/Tag";
import { Post } from "../entities/Post";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DB.URL,

  synchronize: !env.isProd,
  logging: !env.isProd,

  entities: [User, Category, Tag, Post],
  migrations: ["src/migrations/**/*.{ts,js}"],
});
