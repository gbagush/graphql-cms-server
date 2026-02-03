import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

@ObjectType()
@Entity("tags")
export class Tag extends BaseEntity {
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

  @Field()
  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
