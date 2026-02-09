import { GraphQLError } from "graphql/error";
import { AppDataSource } from "../../lib/datasource";
import { User, UserRole } from "../../entities/User";
import { comparePassword, hashPassword } from "../../lib/password";

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getCount(): Promise<number> {
    return this.userRepository.count();
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new GraphQLError("Email already exists", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

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

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const user = await this.getById(id);

    if (payload.name !== undefined) {
      user.name = payload.name;
    }

    if (payload.email !== undefined && payload.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (existingUser) {
        throw new GraphQLError("Email already exists", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      user.email = payload.email;
    }

    if (payload.password !== undefined) {
      user.password = await hashPassword(payload.password);
    }

    if (payload.role !== undefined) {
      user.role = payload.role;
    }

    if (payload.avatarUrl !== undefined) {
      user.avatarUrl = payload.avatarUrl;
    }

    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.getById(id);
    await this.userRepository.remove(user);
    return true;
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
