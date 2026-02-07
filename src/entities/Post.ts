import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Tag } from "./Tag";
import { GraphQLJSON } from "graphql-scalars";

@ObjectType()
@Entity("posts")
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Field()
  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  excerpt?: string;

  @Field(() => GraphQLJSON)
  @Column({ type: "json" })
  content!: Record<string, any>;

  @Field(() => User)
  @ManyToOne(() => User, {
    onDelete: "RESTRICT",
  })
  author!: User;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: "SET NULL",
  })
  category?: Category | null;

  @Field(() => [Tag])
  @ManyToMany(() => Tag)
  @JoinTable({
    name: "post_tags",
    joinColumn: { name: "post_id" },
    inverseJoinColumn: { name: "tag_id" },
  })
  tags!: Tag[];

  @Field({ nullable: true })
  @Column({ type: "timestamp", nullable: true })
  published_at!: Date | null;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  @Field()
  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
