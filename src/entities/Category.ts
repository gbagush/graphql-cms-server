import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

@ObjectType()
@Entity("categories")
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Field()
  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: "SET NULL",
  })
  parent?: Category | null;

  @Field(() => [Category])
  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @Field()
  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
