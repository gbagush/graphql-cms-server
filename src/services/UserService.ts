import { GraphQLError } from "graphql/error";
import { AppDataSource } from "../lib/datasource";
import { User, UserRole } from "../entities/User";
import { comparePassword, hashPassword } from "../lib/password";

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getCount(): Promise<number> {
    return this.userRepository.count();
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const hashedPassword = await hashPassword(payload.password);

    const user = this.userRepository.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    });

    return this.userRepository.save(user);
  }

  async getById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return user;
  }

  async verifyUserCredential(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    return user;
  }
}
